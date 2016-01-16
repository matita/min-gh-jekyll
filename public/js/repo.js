var MyLinks = (function() {

  var userName = 'matita';
  var repoName = 'min-gh-jekyll';
  var branch = 'gh-pages';
  var repo;

  init();



  function init() {
    var token = localStorage['gh-auth'];
    if (token)
      setRepo(token);

    initBodyClass();
  }

  function initBodyClass() {
    if (isLogged()) {
      document.body.classList.add('logged-in');
    } else {
      document.body.classList.remove('logged-in');
    }
  }


  function isLogged() {
    return !!repo;
  }


  function setRepo(token) {
    var github = new Github({
      token: token,
      auth: 'oauth'
    });
    repo = github.getRepo(userName, repoName);
  }


  function logIn(cb) {
    loginForm.open(function(dom) {
      var token = dom.querySelector('input').value;
      
      if (token) {
        localStorage['gh-auth'] = token;
        setRepo(token);
      }

      initBodyClass();

      if (cb)
        cb(token ? null : 'Not logged in', token);
    });
  }


  function logOut() {
    delete localStorage['gh-auto'];
    repo = null;
    initBodyClass();
  }


  function remove(path, cb) {
    if (!isLogged()) {
      return logIn(function(err, token) {
        if (err)
          return cb(err);
        remove(path, cb);
      });
    }


    repo.remove(branch, path, function(err) {
      cb(err);
    });
  }


  function move(path, category, cb) {
    if (!isLogged()) {
      return logIn(function(err, token) {
        if (err)
          return cb(err);
        move(path, category, cb);
      });
    }


    var oldPath = path;
    var parts = path.split('_posts');
    var title = parts[1] || parts[0];
    var newPath = category + '/_posts' + title;

    console.log('read', oldPath);
    repo.read(branch, oldPath, function(err, content) {
      if (err)
        return cb(err);
      
      console.log('write', newPath);
      var commitMessage = 'Archived post ' + oldPath;
      repo.write(branch, newPath, content, commitMessage, function(err) {
        if (err)
          return linkcb(err);
        console.log('remove', oldPath);
        repo.remove(branch, oldPath, function(err) {
          cb(err);
        });
      });
    });
  }




  return {
    remove   : remove,
    move     : move,
    logOut   : logOut,
    logIn    : logIn
  }
})();