var meta;
var title = getMetaValue('title') ||
  getMetaValue('og:title', 'property') ||
  document.title;
var description = getMetaValue('description') ||
  getMetaValue('og:description', 'property');
var url = window.location.href;


var filename = getFileName(title);
var frontMatter = '---' +
  '\r\ntitle: ' + title +
  '\r\ndescription: ' + description +
  '\r\nlink: ' + url +
  '\r\nsaved: ' + formatDate() +
  '\r\n---';


var originalHtml = getContentHtml();
console.log('containers', html);
//window.open('https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=_posts/' + encodeURIComponent(filename) + '.md&value=' + encodeURIComponent(frontMatter));

var w = window.contentW || window.open();
var wDoc = w.document;

wDoc.head.innerHTML = '<base href="' + url + '"><style>' +
  'body { font-family: Georgia; font-size: 20px; max-width: 700px; margin: 0 auto; color: #555; line-height: 1.8; padding: 2em 10px; }' + 
  'h1, h2, h3, h4, h5, h6 { font-family: Arial, Helvetica, sans-serif; line-height: 1.2; }' +
  'a[href] { color: #6a9fb5; text-decoration: none; }' +
  'a[href]:hover { text-decoration: underline; }' +
  'img { max-width: 100%; height: auto; display: block; margin: 0 auto; text-align: center }' +
  'iframe { max-width: 100%; display: block; margin: 0 auto; }' +
  'pre { padding: 1em; background: #eee; font-size: 14px; overflow: auto; }' +
  'blockquote { border-left: 5px solid #ddd; margin-left: 0; padding-left: 1em; }' +
  '#html-content { width: 100%; display: block; height: 300px; }' +
  '</style>';

var html = '<h1 style="border-bottom: 1px solid #eee; padding-bottom: 1em; margin-bottom: 1em;">' + title + '</h1>' +
  originalHtml +
  '<hr>' +
  '<textarea id="html-content"></textarea>' +
  '<a href="https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=' + encodeURIComponent('_posts/' + filename) + '&value=' + encodeURIComponent(frontMatter) + '" target="_blank">Add to repository</a>';


wDoc.body.innerHTML = html;
wDoc.getElementById('html-content').value = originalHtml;


function getFileName(title) {
  var now = new Date();
  return now.getFullYear() + '-' +
    pad(now.getMonth() + 1) + '-' +
    pad(now.getDate()) + '-' +
    (title || '').toLowerCase().replace(/^\W+(.*)\W+$/, '$1').replace(/\W+/g, '-');
}

function formatDate(date) {
  date = date || new Date();
  return date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds());
}

function pad(num) {
  return ('0' + num).substr(-2);
}

function getMetaValue(name, nameAttr) {
  nameAttr = nameAttr || 'name';
  var meta = document.querySelector('head meta[' + nameAttr + '="' + name + '"]');
  return meta && meta.getAttribute('content') || null;
}


function getContentHtml() {
  var parent = getBestParent();
  var html;

  if (parent) {
    var cln = parent.cloneNode(true);
    sanitizeNode(cln);

    html = cln.innerHTML;
  }

  return html;
}


function getBestParent() {
  var ps = document.getElementsByTagName('p');
  var parents = [];
  var contents = [];
  var maxLength = 0;
  var maxIndex = 0;

  for (var i = 0; i < ps.length; i++) {
    var p = ps[i];
    var parent = p.parentNode;
    
    if (parent.tagName == 'FORM')
      continue;
    if (parent.className.toLowerCase().match(/(\b|-|_)comments\b/i))
      continue;
    
    var parentIndex = parents.indexOf(parent);
    if (parentIndex == -1) {
      parentIndex = parents.length;
      parents.push(parent);
    }

    var parentPs = contents[parentIndex];
    if (!parentPs)
      parentPs = contents[parentIndex] = [];
    
    parentPs.push(p);
    if (parentPs.length > maxLength) {
      maxLength = parentPs.length;
      maxIndex = parentIndex;
    }
  }

  var parent = parents[maxIndex];
  return parent;
}


function sanitizeNode(node) {
  var nodes, n, i;

  // remove scripts
  nodes = node.getElementsByTagName('script');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    n.parentNode.removeChild(n);
  }

  // remove styles
  nodes = node.getElementsByTagName('style');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    n.parentNode.removeChild(n);
  }

  // remove empty divs
  nodes = node.getElementsByTagName('div');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    if (!n.lastChild)
      n.parentNode.removeChild(n);
  }

  /*
  // normalize links
  nodes = node.getElementsByTagName('a');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    if (!n.href) // do not normalize local links
      continue;
    else if (n.host == location.host && n.pathname == location.pathname && n.search == location.search)
      n.href = n.hash;
    else
      n.href = n.href;
  }

  // normalize img urls
  var a = document.createElement('a');
  nodes = node.getElementsByTagName('img');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    var src = n.getAttribute('data-src') || n.src;
    a.href = src;
    n.src = a.href;
  }

  // normalize iframes urls
  nodes = node.getElementsByTagName('iframe');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    var src = n.getAttribute('data-src') || n.src;
    a.href = src;
    n.src = a.href;
  }
  */
}