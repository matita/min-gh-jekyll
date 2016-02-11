var MyLinks = (function() {

  var userName = 'matita';
  var repoName = 'min-gh-jekyll';
  var branch = 'gh-pages';
  var defaultCategory = 'to_read';
  var repo;
  var moving = loadMovingPosts();
  console.log('load moving', moving);

  init();


  function loadMovingPosts() {
    if (!window.localStorage)
      return {};

    return JSON.parse(localStorage['mylinks_moving'] || '{}');
  }


  function saveMovingPosts() {
    console.log('save moving', moving);
    if (!window.localStorage)
      return;

    localStorage['mylinks_moving'] = JSON.stringify(moving || {});
  }


  function setAsMoving(link, targetCategory) {
    console.log('set as moving', link);
    moving[link] = targetCategory;
    saveMovingPosts();
  }

  function setAsMoved(link) {
    console.log('set as moved', link);
    delete moving[link];
  }

  function displayMovingLinks() {
    if (!document.querySelector('.category-links'))
      return;

    for (var path in moving) {
      var node = document.querySelector('[data-path="' + path + '"]');
      if (node) {
        var currentCategory = node.getAttribute('data-category');
        var targetCategory = moving[path];
        if (currentCategory == targetCategory)
          setAsMoved(path);
        else
          node.setAttribute('data-target-category', targetCategory);
      } else {
        setAsMoved(path);
      }
    }
    saveMovingPosts();
  }


  function init() {
    var token = localStorage['gh-auth'];
    if (token)
      setRepo(token);

    displayMovingLinks();
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


  function save(url, filename, content, cb) {
    if (!isLogged()) {
      return logIn(function(err, token) {
        if (err)
          return cb(err);
        save(url, filename, content, cb);
      });
    }

    var path = defaultCategory + '/_posts/' + filename;
    var commitMessage = 'Saved from ' + url;
    repo.write(branch, path, content, commitMessage, function(err) {
      cb(err, path);
    });
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
    setAsMoving(oldPath, category);
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
          cb(err, newPath);
        });
      });
    });
  }


  var indexedPosts;
  function loadIndexedPosts(cb) {
    if (indexedPosts)
      return setTimeout(function() { cb(null, indexedPosts); });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/min-gh-jekyll/indexed-posts.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          indexedPosts = JSON.parse(xhr.responseText);
          cb(null, indexedPosts);
        } else
          cb(xhr.status);
      } 
    };
    xhr.send();
  }

  function search(text, cb) {
    loadIndexedPosts(function(err, posts) {
      if (err)
        return cb(err);

      var words = text.toLowerCase().split(/\W+/);
      var result = posts.filter(function(post) {
        return words.every(function(word) {
          var re = new RegExp('\\b' + word + '\\b');
          return re.test(post.words);
        });
      });
      cb(null, result);
    });
  }




  return {
    save     : save,
    remove   : remove,
    move     : move,
    logOut   : logOut,
    logIn    : logIn,
    search   : search
  }
})();