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




  return {
    actionBtn : actionBtn
  };

})();