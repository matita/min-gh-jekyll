function modal(selector) {
  var dom = document.querySelector(selector);
  var ok = dom.querySelector('.modal-ok');
  var cancel = dom.querySelector('.modal-cancel');
  var okCallback;

  var me = {
    open: function(cb) {
      dom.classList.add('open');
      okCallback = cb;
      return me;
    },

    close: function() {
      dom.classList.remove('open');
      return me;
    }
  };


  ok.addEventListener('click', function() {
    if (okCallback)
      okCallback(dom);
    me.close(); 
  }, false);
  cancel.addEventListener('click', me.close, false);
  dom.addEventListener('click', function(e) {
    if (!dom.matches('.open'))
      return;

    if (e.target.matches('.modal-wrap *'))
      return;

    me.close();
  }, false);

  return me;
}