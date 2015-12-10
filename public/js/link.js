function Link(link) {
  if (typeof link == 'string')
    link = { path: link };

  var proto = {
    isArchived: function() { return false; },
    save: function() {},
    archive: function() {},
    delete: function() {}
  };

  for (var p in proto)
    link[p] = proto[p];

  return link;
}