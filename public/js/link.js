function Link(link) {
  if (typeof link == 'string')
    link = { path: link };

  emitonoff(link);

  var repo = util.getRepo();
  var branch = 'gh-pages';

  var proto = {
    isArchived: function() { return false; },

    save: function() {
      link.emit('beforesave');

      if (!repo)
        setTimeout(function() { link.emit('save', 'GitHub user not authenticated'); }, 0)
      else {
        var commitMessage = 'Saved from ' + link.url;
        repo.write(branch, '_posts/' + link.filename, link.frontMatter + '\n' + link.content, commitMessage, function(err) {
          link.emit('save', err);
        });
      }

      return link; 
    },

    archive: function() {
      link.emit('beforearchive');
      repo.move(branch, link.path, link.path.replace('_posts', '_posts/archive'), function(err) {
        link.emit('archive');
      });
      return link; 
    },

    delete: function() { return link; }
  };

  for (var p in proto)
    link[p] = proto[p];

  if (link.path)
    link.filename = link.path.split('/').pop();

  return link;
}