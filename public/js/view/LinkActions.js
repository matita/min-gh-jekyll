function linkActions(node, link) {

  // save
  link.on('beforesave', function() {
    node.classList.add('gh-saving');
  });

  link.on('save', function(err) {
    node.classList.remove('gh-saving');
    if (err)
      alert(err);
  });

  node.querySelector('.gh-save').addEventListener('click', function(e) {
    link.save();
    e.preventDefault();
    return false;
  }, false);
}