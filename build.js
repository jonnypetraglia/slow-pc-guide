var fs = require('fs')
  , path = require('path')
var mkdirp = require('mkdirp')
  , Promise = (global.Promise || require('promiscuous'))
  , ebrew = require('ebrew')
  , markdown = require('markdown-it')('commonmark')
    .use(require('markdown-it-anchor'), {permalink: true})
  , wkhtmltopdf = require('wkhtmltopdf')
  , mdtoc = require('markdown-toc')


// Meta info about the book
var meta = require('./meta.json'),
    websiteDir = path.join(__dirname, "dist"),
    ebookDir = path.join(__dirname, "dist", "ebook")
var pagebreak = "\n\n******\n\n";



// 0. Create output directories
new Promise(function(resolve, reject) {
  mkdirp(ebookDir, vow(resolve, reject))
})
// 1. Read ALL the chapters!
.then(function() {
  return Promise.all(meta.contents.map(function(filename) {
    return new Promise(function(resolve, reject) {
      fs.readFile(filename, {encoding: 'utf8'}, vow(resolve, reject));
    })
  }))
})
// 3. Create the Github Pages versions
.then(function(fileContentsArray) {
  return Promise.all(fileContentsArray.map(function(fileContents, index) {
    return new Promise(function(resolve, reject) {
      var filename = meta.contents[index];
      if(/^readme/i.test(filename)) filename = "index.md";
      fs.writeFile(
        path.join(websiteDir, filename.replace(/\.[^\.]+$/, '.html')),
        wrapHTML(insertTOC(fileContents, mdtoc(fileContents).content, false), filename),
        vow(resolve, reject)
      );
    })
  })).then(function() {
    return fileContentsArray;
  })
})
// 3. Create the markdown and generate each filetype
.then(function(fileContentsArary) {
  var md = insertTOC(fileContentsArary.join(pagebreak), true);
  
  return Promise.all(Object.keys(generate).map(function(filetype) {
    generate[filetype](md, path.join(ebookDir, meta.title+"."+filetype));
  }));
})
.then(function() {
  console.log("Complete")
})
.catch(function(err) {
  console.error(err.stack);
  throw err
})


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
      ebrew.generate("meta.json", filename, vow(resolve, reject));
    })
  }
}

// Styles available for HTML exporting
var styles = {
  "github":           "github-markdown-css/github-markdown.css",
  "avenir-white":     "markdown-css-themes/avenir-white.css",
  "foghorn":          "markdown-css-themes/foghorn.css",
  "swiss":            "markdown-css-themes/swiss.css",
}


function insertTOC(md, firsth1) {
  var toc = "## Table of Contents ##\n\n" + mdtoc(md, {firsth1: firsth1}).content + pagebreak

  var delim = "\n##"
  var ind = md.indexOf(delim);
  if(ind===0)
    return md
  return md.slice(0, ind) + toc + md.slice(ind);
}

function wrapHTML(md, filename) {
  var env = {}
  md = markdown.use(require('markdown-it-title')).render(md, env);
  var html = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset='UTF-8'>\n<title>\n"
            + env.title + " - " + meta.title
            + "\n</title>\n";

  html = html+"<style>\n"
        + "html, body {width:100%;height:100%;margin:0;}\n"
        + ".markdown-body {min-width: 200px;max-width: 790px;margin: 0 auto;padding: 30px;}\n"
        + "#" + mdtoc.slugify(env.title) + " {font-size: 4em}\n"
        + "#table-of-contents + ul {list-style: circle;}\n"
        + "</style>\n</head>\n<body>"
  if(filename) {
    html = html+"<link rel='stylesheet' href='styles/" + styles['github'] + "'>\n"
          + "<style>\n"
          + ".site-nav {border-bottom: 1px solid #5A5A5A;line-height: 1.6;font-family: 'Helvetica Neue','Helvetica','Open Sans',sans-serif;font-size: 1.2em;}\n"
          + ".site-nav ul {padding: 0px 20px;display: flex;justify-content: space-between;list-style: outside none none;max-width: 955px;margin: 0px auto;}\n"
          + ".site-nav a {color: #6A6A6A;text-decoration:none;font-weight:400;}\n"
          + ".site-nav a[href='" + filename.replace(/\.[^\.]+$/, '') + ".html']{color:black;}\n"
          + "@media screen and (max-width: 800px) {.site-nav ul {flex-direction: column;text-align: center;}}\n"
          + "</style>\n";
  }
  if(filename) {
    html = html+"<nav class='site-nav'>\n<ul>\n";
    meta.contents.forEach(function(filename) {
      var title = filename.replace(/\.[^\.]+$/, '').replace('_', ' ');
      html = html+"<li><a href='"
            + (/^readme/.test(filename) ? 'index.html' : filename.replace(/\.[^\.]+$/, '.html'))
            + "'>" + title + "</a></li>\n"
    })
    html = html+"</ul>\n</nav>\n";
  }
  html = html+"<article class='markdown-body'>\n"
        + md
        + "\n</article>\n</body>\n</html>"
  return html;
}

function vow(res, rej) {
  return function(err, val) {
    if(err) rej(err);
    else res(val);
  }
}