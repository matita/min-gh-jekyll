function Link(link) {
  if (typeof link == 'string')
    link = { path: link };

  emitonoff(link);

  var proto = {
    isArchived: function() { return false; },

    save: function() {
      link.emit('beforesave', link);
      setTimeout(function() {
        link.emit('saved', link);
      }, 1000);
      return link; 
    },

    archive: function() { return link; },

    delete: function() { return link; }
  };

  for (var p in proto)
    link[p] = proto[p];

  if (link.path)
    link.filename = link.path.split('/').pop();

  return link;
}