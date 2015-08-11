var request = require('sync-request'),
    readme2index = require(__dirname + '/util.js').readme2index,
    base64img = require(__dirname + '/util.js').base64img;



var plugins = {
  image: adjustImages,
  link: adjustLinks,
  pagebreak: adjustPagebreaks,
  anchor: require('markdown-it-anchor'),
  title: require('markdown-it-title')
};


function adjustPagebreaks(md) {
  var oldBlockOverride = md.renderer.rules.html_block;
  md.renderer.rules.html_block = function(tokens, idx, options, env, self) {
    if(adjustPagebreaks.RE.test(tokens[idx].content))
      tokens[idx].content = "<hr class='pagebreak'>\n";
    if(oldBlockOverride)
      return oldBlockOverride.apply(self, arguments);
    else
      return self.renderToken.apply(self, arguments);
  };
}
adjustPagebreaks.RE = /<!---*-->/;
adjustPagebreaks.HTML = "\n\n<!--" + Array(80+1-4-3).join('-') + "-->\n\n";
if(!adjustPagebreaks.RE.test(adjustPagebreaks.HTML))
  throw new Error("Pagebreak HTML does not match the pagebreak RE");


// A plugin for markdown-it that adjust permalinks to specify their chapter based on TocHash
//    Example: '#ccleaner' => 'solutions.html#ccleaner'
// If no filename is found
//  (This could possibly be accomplished by https://www.npmjs.com/package/markdown-it-replace-link)
function adjustLinks(md, opts) {
  var oldLinkOpenOverride = md.renderer.rules.link_open;
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    var hrefIndex = tokens[idx].attrIndex('href');
    if(hrefIndex >= 0 && tokens[idx].attrs[hrefIndex][1].indexOf("#") == 0) {
      var hrefTarget = tokens[idx].attrs[hrefIndex][1].substr(1);
      var filename = tocIndex.get(hrefTarget);
      if(filename && filename.length>0)
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
function adjustImages(md, opts) {
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
}


// Builds on top of markdown-it-anchor by:
//   1. Adding a 'title' attribute
//   2. Making an Anchor yield the heading text when bookmarked
//      - done by inserting the text into an invisible <span> inside the <a>
function renderPermalink(slug, opts, tokens, idx) {
  // Ignore empty headers. And remove its blank id.
  var id = tokens[idx].attrIndex("id");
  if(id > -1 && tokens[idx].attrs[id][1].trim()=='') {
    tokens[idx].attrs.splice(id, 1);
    return;
  }

  // Do not permalink the main title of the page; it's at the very top anyway.
  if(!opts.mainTitleHandled) {
    tokens[idx].attrs.push(["class", "page-title"]);
    return opts.mainTitleHandled = true;
  }
  plugins.anchor.defaults.renderPermalink(slug, opts, tokens, idx);

  // Find the <a>
  var children = tokens[idx+1].children;
  var a=0;
  while(a<children.length && children[a].type!="link_open")
    a+=1;

  // Add 'title'
  children[a].attrs.push(['title', 'Permalink']);
  
  // Alter the text of the <a>
  children[a+1].content = tokens[idx+1].content;
  if(opts.siteTitle && opts.siteTitle.toLowerCase() != children[a+1].content.toLowerCase())
    children[a+1].content += " - " + opts.siteTitle
  
  // Wrap the text in a span
  var tags = ["span_open", "span_close"];
  tags.forEach(function(type, index) {
    var span = {type: type, tag: "span"}
    for(var k in children[a+1])
      if(!span[k]) span[k] = children[a+1][k];
    children.splice(a+1+index*2, 0, span);
  });
}


module.exports = function(md, isAggregate) {
  md
    //.use(plugins.anchor, {permalink: true, permalinkSymbol: '#', renderPermalink: renderPermalink, siteTitle: meta.title})
    .use(plugins.title)
    .use(plugins.image, {base64: isAggregate})
    .use(plugins.pagebreak);
  if(!isAggregate)
    md.use(plugins.link, {tocIndex: tocIndex});
  return md;
}
for(var p in plugins)
  module.exports[p] = plugins[p];
