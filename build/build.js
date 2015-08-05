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

//////////////////// Find wkhtmltopdf ////////////////////

var wkhtmltopdf_cmd;
if(fs.existsSync(path.join(__dirname, "wkhtmltopdf", "bin"))) {
  var os = require('os');
  var nixPath = path.join(__dirname, "wkhtmltopdf", "bin");
  if(os.platform()=="darwin")
    wkhtmltopdf_cmd = path.join(nixPath, "wkhtmltopdf_darwin_x86");
  else if(os.platform()=="linux") {
    if(os.arch()=="ia32")
      wkhtmltopdf_cmd = path.join(nixPath, "wkhtmltopdf_linux_x86");
    else if(os.arch()=="x64")
      wkhtmltopdf_cmd = path.join(nixPath, "wkhtmltopdf_linux_amd64");
  }
}
if(!wkhtmltopdf_cmd) {
  console.warn("WARNING: No bundled wkhtmltopdf could be found. Your system's version may produce very large PDF files.");
}

//////////////////// Imports ////////////////////


var mkdirp = require('mkdirp')
  , Promise = (global.Promise || require('promiscuous'))
  , ebrew = require('ebrew')
  , markdown_it = require('markdown-it')
  , wkhtmltopdf = require('wkhtmltopdf', {command: wkhtmltopdf_cmd})
  , mdtoc = require('markdown-toc')
  , imageurl_base64 = require('imageurl-base64')
  , request = require('sync-request')
  , beautify = function(x) { return x};
try {
  // (Optional) This module will make exported HTML easy on the eyes.
  beautify = require('js-beautify').html
  beautify()
} catch(e) {}



//////////////////// cli-args ////////////////////

var argv = ['gh_pages', 'skipassets', 'md', 'html', 'pdf', 'epub']
if(process.argv.indexOf("-d") >= 0) {
  process.argv.splice(process.argv.indexOf("-d"), 1);
  fs.writeFile = function(filename, contents, callback) {
    console.log("Faux file~~~~~~~~~~~~~~~~~~~~~~~")
    callback();
  };
}

if(process.argv.length > 2) {
  if(process.argv.indexOf("-h")>=0 || process.argv.indexOf("--help")>=0) {
    console.log("Usage:",
                process.argv[0],
                require('path').basename(process.argv[1]),
                '[' + argv.join(', ') + ']');
    process.exit(0);
  }
  argv = process.argv.slice(2).map(function (val, index, array) {
    if(argv.indexOf(val) == -1)
      throw(new Error("Invalid argument: " + val));
    return val;
  });
}
argv.contains = function(thing) { return this.indexOf(thing) >= 0};

//////////////////// Setup the environment ////////////////////


process.chdir(__dirname + "/..");

// Paths
var buildDir = __dirname,
    websiteDir = path.resolve(process.cwd(), "dist"),
    ebookDir = path.resolve(websiteDir, "ebook"),
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


// 0. Make output directories
new Promise(function(resolve, reject) {
  return mkdirp(ebookDir, vow(resolve, reject));
})
// 1. Read file contents
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
// 2. Read ALL the chapters! Also generate TocHash at the same time
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
        resolve(data);
      });
    })
  }))
})
// 3. Create the Github Pages versions
.then(function(fileContentsArray) {
  if(!argv.contains('gh_pages')) return Promise.resolve(fileContentsArray);
  console.log("Generating gh_pages");

  return Promise.all(fileContentsArray.map(function(fileContents, index) {
    return new Promise(function(resolve, reject) {
      var filename = readme2index(meta.contents[index], ".html");
      fs.writeFile(
        path.join(websiteDir, filename),
        wrapHTML(insertToC(fileContents, false), filename),
        vow(resolve, reject)
      );
    })
  }))
  // 3a. Copy assets over
  .then(function() {
    if(argv.contains('skipassets')) return Promise.resolve();
    console.log("Generating assets");

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
    return fileContentsArray;
  })
})
// 4. Generate ebooks
.then(function(fileContentsArray) {
  var md = insertToC(fileContentsArray.join(pagebreak), true);

  return Promise.all(Object.keys(generate).map(function(filetype) {
    if(!argv.contains(filetype)) return Promise.resolve();
    console.log("Generating " + filetype);
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

function insertToC(md, firsth1) {
  var delim = "\n##"
  var ind = md.indexOf(delim);
  if(ind === 0)
    return md;

  var toc = "## Table of Contents ##\n\n" + 
          //(tocJson ? tocJson.content : mdtoc(md, {firsth1: false}).content) + pagebreak;
          mdtoc(md, {firsth1: firsth1}).content + pagebreak;
  return md.slice(0, ind) + toc + md.slice(ind);
}


// Creates a complete HTML file (i.e. with <html>, <body>, styles, etc)
function wrapHTML(md, originalFilename) {
  var isAggregateFile = !originalFilename; //Just to be more clear

  // 1. Render the markdown
  var env = {}
  var mdit = markdown_it('commonmark')
      .use(require('markdown-it-anchor'), {permalink: true, permalinkSymbol: '#', renderPermalink: adjustPermalinks_plugin})
      .use(require('markdown-it-title'))
      .use(adjustImage_plugin, {base64: isAggregateFile})
  if(!isAggregateFile)
    mdit.use(adjustLinks_plugin);
  var pagehtml = mdit.render(md, env);


  // 2. adjust options for the template
  var opts = {
    titleslug:  mdtoc.slugify(env.title),
    pagehref:   readme2index(originalFilename || '', ".html"),
    pagehtml:   pagehtml,
    title:      meta.title
  };
  if(isAggregateFile) {
    opts.favicon = fileContents['favicon.png'];
    opts.stylesheets = "<style>"+fileContents.theme+"</style>\n<style>"+fileContents['style.css']+"</style>\n";
    opts.heading = null;
  } else {
    if(env.title != meta.title)
      opts.title = env.title + " - " + meta.title;
    opts.favicon =  "favicon.png"
    opts.stylesheets = "<link rel='stylesheet' href='"+path.join("themes", themes[chosenTheme])+"'>\n" + 
        "<link rel='stylesheet' href='style.css'>\n";
    opts.heading = "\n<nav class='site-nav'>\n" + 
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

  // 3. Fill the template
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
//  (This could possibly be accomplished by https://www.npmjs.com/package/markdown-it-replace-link)
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

// A plugin for markdown-it that adjust images for two reasons:
//   1. Adds "logo" class to the logo image
//   2. Replaces URLs with the base64 of an image
function adjustImage_plugin(md, opts) {
  var oldLinkOpenOverride = md.renderer.rules.image;
  md.renderer.rules.image = function(tokens, idx, options, env, self) {
    var src = tokens[idx].attrIndex("src");

    var uri = tokens[idx].attrs[src][1];
    if(opts.base64) {
      if(!fileContents[uri]) {
        // TODO: Do local paths also; a simple 'if isLocalPath uri: fs.readFileSync(uri)'
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


// A stupid simple 'template' function; uses Mustache-esque double brackets: {{}}
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

// A lazy way to deal with callbacks in a promise-based environment
function vow(res, rej) {
  return function(err, val) {
    if(err) rej(err);
    else res(val);
  }
}

function debug() {
  console.log.apply(null,arguments);
}