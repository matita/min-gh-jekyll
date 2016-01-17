util.listen(document.body)
  .on('click', '.gh-move', function(e) {
    var btn = this;
    var path = btn.dataset.path;
    var category = btn.dataset.category;

    e.preventDefault();
    MyLinks.move(path, category, function(err, newPath) {
      if (err)
        return alert((err.error && 'Error ' + err.error) || JSON.stringify(err)); //console.error('Action failed', err);
      
      btn.dataset.path = newPath;
      var post = util.closest(btn, '.post');
      if (post) {
        for (var i = 0; i < post.classList.length; i++) {
          var className = post.classList[i];
          if (className.indexOf('category-') === 0) {
            console.log('current class', className);
            post.classList.remove(className);
            break;
          }
        }
        post.classList.add('category-' + category);
        console.log('added class', 'category-' + category);
      }
      
      console.log('succesfully moved', path);
    });
  });