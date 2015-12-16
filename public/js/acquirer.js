document.body.className += ' gh-acquirer';

var params = location.search.substr(1)
  .split('&')
  .reduce(function(p, e) {
    e = e.split('=');
    p[decodeURIComponent(e[0])] = decodeURIComponent(e[1]);
    return p;
  }, {});

var origin = params.origin;
var post;
var link;
console.log('origin', origin);
window.addEventListener('message', receiveMessage, false);

function receiveMessage(e) {
  if (origin.indexOf(e.origin) == -1)
    return;
  
  var data = e.data;
  var doc = document.implementation.createHTMLDocument();
  doc.head.innerHTML = data.head;
  var base = doc.createElement('base');
  base.href = origin;
  doc.head.appendChild(base);
  doc.body.innerHTML = data.body;

  post = analyze(doc, origin);

  link = Link(post);
  
  document.title = post.title;
  document.querySelector('article h1').innerText = post.title;
  Array.prototype.forEach.call(document.querySelectorAll('.reading-time'), function(s) { s.innerHTML = Math.round(post.node.innerText.split(/\W+/).length / 180) + ' min read'; });
  document.querySelector('main').innerHTML = post.content;
  Array.prototype.forEach.call(document.querySelectorAll('.view-original'), function(a) { a.href = post.url; });

  var postActions = document.querySelectorAll('.gh-post-actions');
  for (var i = 0; i < postActions.length; i++) {
    linkActions(postActions[i], link);
  }
}

window.opener.postMessage('loaded', origin);