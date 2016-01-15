window.util = (function() {

  function actionBtn(selector, action, loadingText) {
    var btn = document.querySelector(selector);
    var parent = btn.parentNode;
    var fn = function() { parent.replaceChild(btn, s); };
    var s = document.createElement('span');
    s.innerHTML = loadingText;


    btn.addEventListener('click', function() {
      parent.replaceChild(s, btn);

      return action(fn);
    }, false);
  }


  var github;

  function getRepo() {
    var userName = 'matita';
    var repoName = 'min-gh-jekyll';
    
    if (!github) {
      var authToken = localStorage['gh-auth']/* || prompt('GitHub auth token')*/;
      
      if (!authToken)
        return null;
      localStorage['gh-auth'] = authToken;

      var github = new Github({
        token: authToken,
        auth: 'oauth'
      });
    }

    var repo = github.getRepo(userName, repoName);
    return repo;
  }




  return {
    actionBtn : actionBtn,
    getRepo   : getRepo
  };

})();