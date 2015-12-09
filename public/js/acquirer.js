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
  
  document.title = post.title;
  document.querySelector('article h1').innerText = post.title;
  Array.prototype.forEach.call(document.querySelectorAll('.reading-time'), function(s) { s.innerHTML = Math.round(post.node.innerText.split(/\W+/).length / 180) + ' min read'; });
  document.querySelector('main').innerHTML = post.content;
  Array.prototype.forEach.call(document.querySelectorAll('.view-original'), function(a) { a.href = post.url; });
}

window.opener.postMessage('loaded', origin);


window.util.actionBtn('.gh-save', function(callback) {
  var userName = 'matita';
  var repoName = 'min-gh-jekyll';
  var branch = 'gh-pages';
  var commitMessage = 'Saved from ' + post.url;
  var authToken = localStorage['gh-auth'] || prompt('GitHub auth token');
  
  if (!authToken)
    return;
  localStorage['gh-auth'] = authToken;

  var github = new Github({
    token: authToken,
    auth: 'oauth'
  });

  var repo = github.getRepo(userName, repoName);
  repo.write(branch, '_posts/' + post.filename, post.frontMatter + '\n' + post.content, commitMessage, function(err) {
    if (err)
      alert('Error while saving: ' + err);
    else {
      setTimeout(function() { window.close(); }, 2000);
    }
    callback();
  });

  return false;
}, 'Saving...');