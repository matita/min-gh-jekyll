util.listen(document.body)
  .on('click', '.gh-delete', function(e) {
    var btn = this;
    var path = btn.dataset.path;

    e.preventDefault();
    MyLinks.remove(path, function(err) {
      if (err)
        return alert((err.error && 'Error ' + err.error) || JSON.stringify(err)); //console.error('Action failed', err);
      console.log('succesfully deleted', path);
    });
  });