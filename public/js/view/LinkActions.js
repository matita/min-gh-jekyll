function linkActions(node, link) {

  link.on('beforesave', function() {
    node.classList.add('gh-saving');
  });

  link.on('save', function() {
    node.classList.remove('gh-saving');
  });

  node.querySelector('.gh-save').addEventListener('click', function(e) {
    link.save();
    e.preventDefault();
    return false;
  });
}