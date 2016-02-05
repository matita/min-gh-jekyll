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



  function listen(node) {
    var me = {
      on: function(event, selector, cb) {

        node.addEventListener(event, function(e) {
          var target = e.target;
          if (!target.matches(selector) && !(target = closest(target, selector)))
            return;
          cb.apply(target, arguments);
        }, false);

        return me;
      }
    };

    return me;
  }

  function closest(node, selector) {
    while (node && (!node.matches || !node.matches(selector)))
      node = node.parentNode;
    return node;
  }


  function spinner(container) {
    var s = document.createElement('i');
    s.className = 'fa fa-spinner fa-spin';

    return {
      start: function() { container.insertBefore(s, container.firstChild); },
      stop: function() { if (s.parentNode) s.parentNode.removeChild(s); },
    }
  }




  return {
    actionBtn : actionBtn,
    getRepo: function() {},
    listen    : listen,
    closest   : closest,
    spinner   : spinner
  };

})();