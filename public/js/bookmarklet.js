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


window.open('https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=_posts/' + encodeURIComponent(filename) + '.md&value=' + encodeURIComponent(frontMatter));
  


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