/*
 * This file is used to build the Github Pages site for the guide.
 * This includes generating the "compiled" versions, such as:
 *   - epub
 *   - pdf
 *   - md (one file)
 *   - html (one file)
*/

//////////////////// Imports ////////////////////


var fs = require('fs')
  , path = require('path');
var mkdirp = require('mkdirp')
  , Promise = (global.Promise || require('promiscuous'))
  , ebrew = require('ebrew')
  , markdown_it = require('markdown-it')
  , wkhtmltopdf = require('wkhtmltopdf')
  , mdtoc = require('markdown-toc')
  , beautify = function(x) { return x};
try {
  // (Optional) This module will make exported HTML easy on the eyes.
  beautify = require('js-beautify').html
  beautify()
} catch(e) {}

  // ebrew requires that the markdown files be in the same folder as the JSON file.
  // So let's monkeypatch the call to return the working directory
var oldDirname = path.dirname;
path.dirname = function(arg) {
  return arg==__dirname + "/meta.json" ? process.cwd() : oldDirname(arg);
};


//////////////////// Setup the environment ////////////////////


process.chdir(__dirname + "/..")

// Meta info about the book
var meta = require(__dirname + "/meta.json"),
    websiteDir = path.resolve(process.cwd(), "dist"),
    ebookDir = path.resolve(process.cwd(), "dist", "ebook"),
// Useful vars
    pagebreak = "\n\n******\n\n",
    TocHash = {},   // ToC entry is key, value is file it is in (hardware_failure -> solutions.md)
// Styles available for HTML exporting
  styles = {
  "github":           "github-markdown-css/github-markdown.css",
  "avenir-white":     "markdown-css-themes/avenir-white.css",
  "foghorn":          "markdown-css-themes/foghorn.css",
  "swiss":            "markdown-css-themes/swiss.css",
  //https://github.com/markdowncss/air
}, chosenStyle = "github" 
, fileContents = {
  style:    path.join(websiteDir, "styles", styles[chosenStyle]),
  template: path.join(__dirname, "templ.html"),
  //image:    path.join(__dirname, "noun_22554_cc.png"),
  //favicon:  path.join(__dirname, "favicon.png"),
};


//////////////////// Start the promise chain ////////////////////


// 0. Create output directories, read misc files
new Promise(function(resolve, reject) {
  return mkdirp(ebookDir, vow(resolve, reject));
})
.then(function() {
  return Promise.all(Object.keys(fileContents).map(function(key) {
    return new Promise(function(resolve, reject) {
      fs.readFile(fileContents[key], {encoding: 'utf-8'}, vow(resolve, reject));
    }).then(function(data) {
      fileContents[key] = data;
    });
  }));
})
// 1. Read ALL the chapters! Also generate TocHash at the same time
.then(function() {
  return Promise.all(meta.contents.map(function(filename) {
    return new Promise(function(resolve, reject) {
      fs.readFile(filename, {encoding: 'utf8'}, function(err, data) {
        if(err) return reject(err);
        var tocData = mdtoc(data);
        for(var x in tocData.json) {
          var hash = mdtoc.slugify(tocData.json[x].content);
          if(TocHash[hash]) return reject("#"+hash+" used multiple times");
          TocHash[hash] = filename;
        }
        resolve({toc: tocData, md: data, filename: filename});
      });
    })
  }))
})
// 3. Create the Github Pages versions
.then(function(fileDataArray) {
  return Promise.all(fileDataArray.map(function(fileData, index) {
    return new Promise(function(resolve, reject) {
      var filename = readme2index(fileData.filename, ".html");
      fs.writeFile(
        path.join(websiteDir, filename),
        wrapHTML(fileData.md, fileData.toc, filename),
        vow(resolve, reject)
      );
    })
  })).then(function() { 
    return fileDataArray.map(function(file) {
      return file.md;
    }).join(pagebreak);
  })
})
// 3. Create the markdown and generate each filetype
.then(function(md) {
  return Promise.all(Object.keys(generate).map(function(filetype) {
    return generate[filetype](md, path.join(ebookDir, meta.title+"."+filetype));
  }));
})
.then(function() {
  console.log("Complete")
})
.catch(function(err) {
  console.error(err.stack);
  throw err
})

//////////////////// Filetype generation ////////////////////

var generate = {
  md: function(md, filename) {
    return new Promise(function(resolve, reject) {
      fs.writeFile(filename, md, vow(resolve, reject))
    })
  },
  html: function(md, filename) {
    return new Promise(function(resolve, reject) {
      fs.writeFile(filename, wrapHTML(md), vow(resolve, reject))
    })
  },
  pdf: function(md, filename) {
    return new Promise(function(resolve, reject) {
      wkhtmltopdf(wrapHTML(md), { output: filename }, function (code, signal) {
        if(code || signal) reject(code || signal);
        else resolve();
      });
    });
  },
  epub: function(md, filename) {
    return new Promise(function(resolve, reject) {
      ebrew.generate(__dirname + "/meta.json", filename, vow(resolve, reject));
    })
  }
};

//////////////////// Auxiliary functions ////////////////////


// Does several things; takes in the markdown and spits out the fully-rendered ToC'ed HTML
function wrapHTML(md, tocJson, originalFilename) {
  // 1. Insert the ToC into the markdown
  var toc = "## Table of Contents ##\n\n" + (tocJson ? tocJson.content : mdtoc(md).content) + pagebreak;
  var delim = "\n##"
  var ind = md.indexOf(delim);
  if(ind !== 0)
    md = md.slice(0, ind) + toc + md.slice(ind);

  // 2. Renders the markdown into HTML (including adjusting permalinks)
  var env = {}

  var mdit = markdown_it('commonmark')
      .use(require('markdown-it-anchor'), {permalink: true, permalinkSymbol: '#', renderPermalink: renderPermalink})
      .use(require('markdown-it-title'));
  if(tocJson)
    mdit.use(adjustPermalinks_plugin);
  var pagehtml = mdit.render(md, env);

  var opts = {
    title: env.title + " - " + meta.title,
    titleslug: mdtoc.slugify(env.title),
    cssurl: "styles/" + styles[chosenStyle],
    pagehref: readme2index(originalFilename || '', ".html"),
    sitenav: meta.contents.map(function(filename) {
      var title = readme2other(filename, "about").replace(/_/g, " ").toLowerCase();
      return "<li><a href='"
            + readme2index(filename, ".html")
            + "'>" + title + "</a></li>";
    }).join("\n"),
    pagehtml: pagehtml
  };

  return beautify(template(fileContents.template, opts));
}

// Builds on top of markdown-it-anchor by:
//   1. Adding a 'title' attribute
//   2. Making an Anchor yield the heading text when bookmarked
//      - done by inserting the text into an invisible <span> inside the <a>
var renderPermalink = function(slug, opts, tokens, idx) {
  require('markdown-it-anchor').defaults.renderPermalink(slug, opts, tokens, idx);

  // Find the <a>
  var children = tokens[idx+1].children;
  var a=0;
  while(a<children.length && children[a].type!="link_open")
    a+=1;

  // Add 'title'
  children[a].attrs.push(['title', 'Permalink']);
  
  // Alter the text of the <a>
  children[a+1].content = meta.title
  if(children[0].content.toLowerCase() != meta.title.toLowerCase())
    children[a+1].content = children[0].content + " - " + children[a+1].content
  
  // Wrap the text in a span
  var tags = ["span_open", "span_close"];
  tags.forEach(function(type, index) {
    var span = {type: "span_open", tag:"span"}
    for(var k in children[a+1])
      if(!span[k]) span[k] = children[a+1][k];
    children.splice(a+1+index*2, 0, span);
  });
};

// A plugin for markdown-it that adjust permalinks to specify their chapter based on TocHash
//    Example: '#ccleaner' => 'solutions.html#ccleaner'
function adjustPermalinks_plugin(md) {
  var oldLinkOpenOverride = md.renderer.rules.link_open;
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    var hrefIndex = tokens[idx].attrIndex('href');
    if(hrefIndex >= 0 && tokens[idx].attrs[hrefIndex][1].indexOf("#") == 0) {
      var hrefTarget = tokens[idx].attrs[hrefIndex][1].substr(1);
      var filename = TocHash[hrefTarget];
      if(filename)
        tokens[idx].attrs[hrefIndex][1] = readme2index(filename, ".html") + "#" + hrefTarget;
    }
    if (oldLinkOpenOverride)
      return oldLinkOpenOverride.apply(self, arguments);
    else
      return self.renderToken.apply(self, arguments);
  };
}


// A stupid simple 'template' function
function template(str, vars) {
  Object.keys(vars).forEach(function(key) {
    str = str.replace(new RegExp("{{"+key+"}}","g"), vars[key]);
  });
  return str;
};

// Replaces a file extension with whatever is specified (note: must include the dot)
function replaceExt(str, ext) {
  return str.replace(/\.[^\.]+$/, ext || '');
}

// Converts 'readme.ext' to 'index.ext' (or some 'other' string)
function readme2index(filename, ext) { return readme2other(filename, "index", ext); }
function readme2other(filename, other, ext) {
  return /^readme/i.test(filename) ? other+(ext||"") : replaceExt(filename, ext);
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// A lazy way to deal with callbacks in a promise environment
function vow(res, rej) {
  return function(err, val) {
    if(err) rej(err);
    else res(val);
  }
}