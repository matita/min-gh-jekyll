util.listen(document.body)
  .on('click', '.gh-delete', function(e) {
    var btn = this;
    if (btn.isLoading)
      return;
    var path = btn.dataset.path;

    var spinner = util.spinner(btn);
    spinner.start();

    e.preventDefault();
    MyLinks.remove(path, function(err) {
      spinner.stop();
      if (err)
        return alert((err.error && 'Error ' + err.error) || JSON.stringify(err)); //console.error('Action failed', err);
      console.log('succesfully deleted', path);
    });
  });