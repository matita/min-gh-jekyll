var meta;
var title = getMetaValue('title') ||
  getMetaValue('og:title', 'property') ||
  document.title;
var description = getMetaValue('description') ||
  getMetaValue('og:description', 'property');


var filename = getFileName(title);
var frontMatter = '---' +
  '\r\ntitle: ' + title +
  '\r\ndescription: ' + description +
  '\r\nlink: ' + window.location +
  '\r\nsaved: ' + formatDate() +
  '\r\n---';


var parent = getContentHtml();
console.log('containers', parent);
//window.open('https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=_posts/' + encodeURIComponent(filename) + '.md&value=' + encodeURIComponent(frontMatter));

var w = window.contentW || window.open();
w.document.head.innerHTML = '<style>' +
  'body { font-family: Georgia; font-size: 20px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; padding-top: 2em; padding-bottom: 2em; }' + 
  'a { color: #6a9fb5; text-decoration: none; }' +
  'a:hover { text-decoration: underline; }' +
  '</style>';

w.document.body.innerHTML = '<h1>' + title + '</h1>' +
  parent.innerHTML;
  


function getFileName(title) {
  var now = new Date();
  return now.getFullYear() + '-' +
    pad(now.getMonth() + 1) + '-' +
    pad(now.getDate()) + '-' +
    (title || '').toLowerCase().replace(/\W+/g, '-');
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
  var ps = document.getElementsByTagName('p');
  var parents = [];
  var contents = [];
  var maxLength = 0;
  var maxIndex = 0;

  for (var i = 0; i < ps.length; i++) {
    var p = ps[i];
    var parent = p.parentNode;
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
  
  return parents[maxIndex];
}