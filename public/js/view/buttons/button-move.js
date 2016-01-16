util.listen(document.body)
  .on('click', '.gh-move', function(e) {
    var btn = this;
    var path = btn.dataset.path;
    var category = btn.dataset.category;

    e.preventDefault();
    MyLinks.move(path, category, function(err) {
      if (err)
        return alert((err.error && 'Error ' + err.error) || JSON.stringify(err)); //console.error('Action failed', err);
      console.log('succesfully moved', path);
    });
  });