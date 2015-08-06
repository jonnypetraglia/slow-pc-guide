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
function readme2index(filename, ext) {
  return readme2other(filename, "index", ext);
}
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



function TocIndex(opts) {
  var slugHash = {},
      opts = opts || {},
      allowNoFilename = opts.specialSlugs || [];

  function get(slug) {
    if(!slugHash[slug] && allowNoFilename.indexOf(slug) == -1)
      throw new Error("Slug has no associated filename: '" + slug + "'")
    return slugHash[slug]
  }

  function put(slug, filename) {
    if(slugHash[slug])
      throw new Error("Slug occurred multiple times in ToC: '" + slug + "'");
    slugHash[slug] = filename;
  }

  return {
    get: get,
    put: put
  }
}

module.exports = {
  TocIndex: TocIndex,
  template: template,
  replaceExt: replaceExt,
  readme2index: readme2index,
  readme2other: readme2other,
  toTitleCase: toTitleCase,
  base64img: base64img,
  unbase64: unbase64,
  vow: vow,
  debug: debug
}