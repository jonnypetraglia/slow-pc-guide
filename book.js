var fs = require('fs')
  , path = require('path')
var mkdirp = require('mkdirp')
  , Promise = (global.Promise || require('promiscuous'))
  , ebrew = require('ebrew')
  , markdown = require('markdown-it')('commonmark')
    .use(require('markdown-it-anchor'), {permalink: true})
  , wkhtmltopdf = require('wkhtmltopdf')
  , mdtoc = require('markdown-toc')


// Functions for generating the various file formats
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
      ebrew.generate("book.json", filename, vow(resolve, reject));
    })
  }
}

var styles = {
  "github":           "github-markdown-css/github-markdown.css",
  "avenir-white":     "markdown-css-themes/avenir-white.css",
  "foghorn":          "markdown-css-themes/foghorn.css",
  "swiss":            "markdown-css-themes/swiss.css",
}

// Customizable options (TBD)
var options = {
  outputDir: path.join(__dirname, "dist"),
  filetypes: ["epub", "pdf"],
  css: styles['avenir-white']
}

options.filetypes = Object.keys(generate) //[]

// Meta info about the book
var meta = require('./book.json');
var pagebreak = "\n\n******\n\n";


// 1. Read ALL the chapters!
new Promise(function(resolve, reject) {
  mkdirp(options.outputDir, vow(resolve, reject))
}).then(function() {
  return Promise.all(meta.contents.map(function(filename) {
    return new Promise(function(resolve, reject) {
      fs.readFile(filename, {encoding: 'utf8'}, vow(resolve, reject));
    }).then(function(fileContents) {
// 2. Create the Github Pages versions
      fs.writeFileSync(
        path.join(__dirname, "gh-pages", filename.replace(/\.[^\.]+$/, '.html')),
        wrapHTML(insertTOC(fileContents, mdtoc(fileContents).content, false))
      );
      return fileContents;
    })
  }))
})
.then(function(values) {
// 3. Create the markdown
  var md = insertTOC(values.join(pagebreak), true);
  
// 4. Generate each filetype 
  return Promise.all(options.filetypes.map(function(filetype) {
    generate[filetype](md, path.join(options.outputDir, meta.title+"."+filetype));
  }));
})
.then(function() {
  console.log("Complete")
})
.catch(function(err) {
  console.error(err.stack);
  throw err
})


function insertTOC(md, firsth1) {
  var toc = "## Table of Contents ##\n\n" + mdtoc(md, {firsth1: firsth1}).content + pagebreak

  var delim = "\n##"
  var ind = md.indexOf(delim);
  if(ind===0)
    return md
  return md.slice(0, ind) + toc + md.slice(ind);
}

function wrapHTML(md) {
  var env = {}
  md = markdown.use(require('markdown-it-title')).render(md, env);
  return "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>"
    + env.title
    + "</title>"
    + "<link rel='stylesheet' href='styles/" + options.css + "'>"
    + "<style>"
    //+ ".markdown-body {min-width: 200px;max-width: 790px;margin: 0 auto;padding: 30px;} "
    + "#" + mdtoc.slugify(env.title) + " {font-size: 4em} "
    + "#table-of-contents + ul {list-style: circle;} "
    + "</style></head><body><article class='markdown-body'>"
    + md
    + "</article></body></html>"
}

function vow(res, rej) {
  return function(err, val) {
    if(err) rej(err);
    else res(val);
  }
}