/*
 * This file is used to build the Github Pages site for the guide.
 * This includes generating the "compiled" versions, such as:
 *   - epub
 *   - pdf
 *   - md (one file)
 *   - html (one file)
*/

//////////////////// Pre-import trickery ////////////////////

var fs = require('fs')
  , path = require('path');

  // ebrew requires that the markdown files be in the same folder as the JSON file.
  // So let's monkeypatch the call to return the working directory
var oldDirname = path.dirname;
path.dirname = function(arg) {
  return arg==buildDir + "/meta.json" ? process.cwd() : oldDirname(arg);
};

var oldRequire = require;
var fakeMarked = function(md) {
  return markdown_it('commonmark')(md);
};
fakeMarked.setOptions = function() {};
drequire = function(name) {
  if(name=="marked") return fakeMarked;
  return oldRequire(name);
};

//////////////////// Imports ////////////////////


var mkdirp = require('mkdirp')
  , Promise = (global.Promise || require('promiscuous'))
  , ebrew = require('ebrew')
  , markdown_it = require('markdown-it')
  , wkhtmltopdf = require('wkhtmltopdf')
  , mdtoc = require('markdown-toc')
  , imageurl_base64 = require('imageurl-base64')
  , request = require('sync-request')
  , beautify = function(x) { return x};
try {
  // (Optional) This module will make exported HTML easy on the eyes.
  beautify = require('js-beautify').html
  beautify()
} catch(e) {}


//////////////////// Setup the environment ////////////////////


process.chdir(__dirname + "/..");

// Paths
var buildDir = __dirname,
    websiteDir = path.resolve(process.cwd(), "dist"),
    ebookDir = path.resolve(process.cwd(), "dist", "ebook"),
// Useful vars
    meta = require(__dirname + "/meta.json")
    pagebreak = "\n\n******\n\n",
    TocHash = {},   // ToC entry is key, value is file it is in (hardware_failure -> solutions.md)
// Styles available for HTML exporting
  themes = {
  "github":           "github-markdown-css/github-markdown.css",
  "avenir-white":     "markdown-css-themes/avenir-white.css",
  "foghorn":          "markdown-css-themes/foghorn.css",
  "swiss":            "markdown-css-themes/swiss.css",
  //https://github.com/markdowncss/air
}, chosenTheme = "github"
, fileContents = {
  theme:          path.join(websiteDir, "themes", themes[chosenTheme]),
  template:       path.join(buildDir, "templ.html"),
  "style.css":    path.join(buildDir, "style.css"),
  "logo.png":     path.join(buildDir, "..", "logo.png"),
  "favicon.png":  path.join(buildDir, "favicon.png"),
}; // images [png,jpg,gif,webp] are stored as browser-ready base64, everything else is text


//////////////////// Start the promise chain ////////////////////


// 0. Create output directories, read misc files
new Promise(function(resolve, reject) {
  return mkdirp(ebookDir, vow(resolve, reject));
})
.then(function() {
  return Promise.all(Object.keys(fileContents).map(function(filename) {
    var isImage = /\.(png|jpg|gif|webp)$/i.test(filename);
    return new Promise(function(resolve, reject) {
      fs.readFile(fileContents[filename],
        {encoding: isImage ? null : 'utf-8'},
        vow(resolve, reject));
    }).then(function(data) {
      fileContents[filename] = isImage ? base64img(data, path.extname(filename)) : data;
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
  }))
  // Copy assets over
  .then(function() {
    return Promise.all(["logo.png", "favicon.png", "style.css"].map(function(filename) {
      var isImage = /\.(png|jpg|gif|webp)$/i.test(filename);
      return new Promise(function(resolve, reject) {
        fs.writeFile(
          path.join(websiteDir, filename),
          isImage ? unbase64(fileContents[filename]) : fileContents[filename],
          isImage ? "base64" : "utf-8",
          vow(resolve, reject)
        );
      });
    }));
  })
  .then(function() {
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
  console.log("Build finished with no errors");
})
.catch(function(err) {
  console.error(err.stack || ("ERROR: "+err));
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
      ebrew.generate(buildDir + "/meta.json", filename, vow(resolve, reject));
    })
  }
};

//////////////////// Auxiliary functions ////////////////////


// Does several things; takes in the markdown and spits out the fully-rendered ToC'ed HTML
function wrapHTML(md, tocJson, originalFilename) {
  var isAggregateFile = !originalFilename; //Just to be more clear

  // 1. Insert the ToC into the markdown
  var toc = "## Table of Contents ##\n\n" + (tocJson ? tocJson.content : mdtoc(md).content) + pagebreak;
  var delim = "\n##"
  var ind = md.indexOf(delim);
  if(ind !== 0)
    md = md.slice(0, ind) + toc + md.slice(ind);

  // 2. Renders the markdown into HTML (including adjusting permalinks)
  var env = {}

  var mdit = markdown_it('commonmark')
      .use(require('markdown-it-anchor'), {permalink: true, permalinkSymbol: '#', renderPermalink: adjustPermalinks_plugin})
      .use(require('markdown-it-title'))
      .use(adjustImage_plugin, {base64: isAggregateFile})
  if(tocJson)
    mdit.use(adjustLinks_plugin);
  var pagehtml = mdit.render(md, env);


  var opts = {
    title:      env.title + " - " + meta.title,
    titleslug:  mdtoc.slugify(env.title),
    pagehref:   readme2index(originalFilename || '', ".html"),
    pagehtml:   pagehtml
  };
  if(isAggregateFile) {
    opts.favicon = fileContents['favicon.png'];
    opts.stylesheets = "<style>"+fileContents.theme+"</style>\n<style>"+fileContents['style.css']+"</style>\n";
  } else {
    opts.favicon =  "favicon.png"
    opts.stylesheets = "<link rel='stylesheet' href='"+path.join("themes", themes[chosenTheme])+"'>\n" + 
        "<link rel='stylesheet' href='style.css'>\n";
    opts.sitenav = "\n<nav class='site-nav'>\n" + 
      "<ul>\n" + 
      "<li>\n<a>\n" + "<img src='" + opts.favicon + "'>\n<strong>"+meta.title+"</strong>\n</a>\n</li>\n" + 
      meta.contents.map(function(filename, i) {
        return ((false && i==Math.round(meta.contents.length/2)) ? "</ul><ul>" : "") +
        template("<li>\n<a href='{{href}}' class='{{class}}'>{{title}}</a>\n</li>\n", {
          href: readme2index(filename, ".html"),
          title: readme2other(filename, "about").replace(/_/g, " ").toLowerCase(),
          class: replaceExt(originalFilename) == readme2index(filename) ? "active" : ''
        });
      }).join("\n") + 
      "</ul>\n</nav>" +
      '<a class="ribbon" href="https://github.com/notbryant/slow-pc-guide"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png"></a>'
  }

  return beautify(template(fileContents.template, opts));
}

// Builds on top of markdown-it-anchor by:
//   1. Adding a 'title' attribute
//   2. Making an Anchor yield the heading text when bookmarked
//      - done by inserting the text into an invisible <span> inside the <a>
var adjustPermalinks_plugin = function(slug, opts, tokens, idx) {
  if(!opts.mainTitleHandled) {
    tokens[idx].attrs.push(["class", "page-title"]);
    return opts.mainTitleHandled = true;
  }
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
function adjustLinks_plugin(md) {
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

function adjustImage_plugin(md, opts) {
  var oldLinkOpenOverride = md.renderer.rules.image;
  md.renderer.rules.image = function(tokens, idx, options, env, self) {
    var src = 0
    while(src<tokens[idx].attrs.length && tokens[idx].attrs[src][0]!="src")
      src+=1;

    var uri = tokens[idx].attrs[src][1];
    if(opts.base64) {
      if(!fileContents[uri]) {
        var res = request("GET", uri);
        if(!/^image\//.test(res.headers['content-type']))
          throw new Error("Wrong content-type, expected an image:" + res.headers['content-type'] + " (" + uri + ")");
        fileContents[uri] = base64img(res.getBody(), res.headers['content-type']);
      }
      tokens[idx].attrs[src][1] = fileContents[uri]
    }
    if(uri=="logo.png")
      tokens[idx].attrs.push(["class", "logo"]);

    if(oldLinkOpenOverride)
      return oldLinkOpenOverride.apply(self, arguments);
    else
      return self.renderToken.apply(self, arguments);
  };
};


// A stupid simple 'template' function
function template(str, vars) {
  Object.keys(vars).forEach(function(key) {
    str = str.replace(new RegExp("{{"+key+"}}","g"), vars[key] || '');
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

function base64img(data, contentType) {
  return "data:" + (contentType||"image/png") + ";base64," + new Buffer(data).toString('base64')
}
function unbase64(data) {
  return data.substr(data.indexOf(";base64,")+";base64,".length);
}

// A lazy way to deal with callbacks in a promise environment
function vow(res, rej) {
  return function(err, val) {
    if(err) rej(err);
    else res(val);
  }
}