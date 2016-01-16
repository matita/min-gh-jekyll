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
  var base = doc.createElement('base');
  base.href = origin;
  doc.head.appendChild(base);
  doc.head.innerHTML += data.head;
  doc.body.innerHTML = data.body;

  post = analyze(doc, origin);

  link = Link(post);
  
  document.title = post.title;
  document.querySelector('article h1').innerText = post.title;
  var main = document.querySelector('main');
  main.innerHTML = post.content;
  Array.prototype.forEach.call(document.querySelectorAll('.reading-time'), function(s) { s.innerHTML = Math.round(main.innerText.split(/\W+/).length / 180) + ' min read'; });
  Array.prototype.forEach.call(document.querySelectorAll('.view-original'), function(a) { a.href = post.url; });

  link.save();

  var postActions = document.querySelectorAll('.gh-post-actions');
  for (var i = 0; i < postActions.length; i++) {
    linkActions(postActions[i], link);
  }
}

window.opener.postMessage('loaded', origin);
window.opener.close();