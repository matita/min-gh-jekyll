function Link(link) {
  if (typeof link == 'string')
    link = { path: link };

  var proto = {
    isArchived: function() { return false; },
    save: function() { return link; },
    archive: function() { return link; },
    delete: function() { return link; }
  };

  for (var p in proto)
    link[p] = proto[p];

  if (link.path)
    link.filename = link.path.split('/').pop();

  return link;
}