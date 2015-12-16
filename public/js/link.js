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
      var oldPath = link.path;
      var newPath = link.path.replace('_posts', '_posts/archive');

      console.log('read', oldPath);
      repo.read(branch, oldPath, function(err, content) {
        if (err)
          return link.emit('archive', err);
        console.log('write', newPath);
        var commitMessage = 'Archived post ' + oldPath;
        repo.write(branch, newPath, content, commitMessage, function(err) {
          if (err)
            return link.emit('archive', err);
          console.log('remove', oldPath);
          repo.remove(branch, oldPath, function(err) {
            link.emit('archive', err);
          });
        });
      });

      

      /*repo.move(branch, oldPath, newPath, function(err) {
        link.emit('archive');
      });*/
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