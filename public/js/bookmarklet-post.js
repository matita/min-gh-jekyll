javascript:(function(){
  var u = 'http://matita.github.io/min-gh-jekyll/acquire?origin='+encodeURIComponent(location.href);
  var w = window.open(u);
  window.addEventListener('message', function(e) {
    console.log('message', e);
    if (u.indexOf(e.origin) == -1)
      return;
    w.postMessage({test:'some data'}, u);
  }, false);
})()