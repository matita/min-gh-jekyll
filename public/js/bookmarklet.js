function analyze(doc, href) {

  var title = getMetaValue('title') ||
    getMetaValue('og:title', 'property') ||
    doc.querySelector('head title').innerText ||
    doc.title;
  var description = getMetaValue('description') ||
    getMetaValue('og:description', 'property');
  console.log('url:', href);
  var url = sanitizeUrl(href);
  console.log('sanitized url:', url);


  var filename = getFileName(title);
  var frontMatter = '---' +
    '\r\ntitle: "' + title + '"' +
    '\r\ndescription: "' + description + '"' +
    '\r\nlink: "' + url + '"' +
    '\r\nsaved: "' + formatDate() + '"' +
    '\r\n---';


  
  var content;
  /*
  content = readabilityHtml(doc);
  /*/
  content = matitaHtml(doc);
  //*/


  return {
    title: title,
    description: description,
    filename: filename,
    url: url,
    frontMatter: frontMatter,
    content: content
  };



  function readabilityHtml(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function(a) { a.href = resolveUrl(origin, a.getAttribute('href')); });
    Array.prototype.forEach.call(doc.querySelectorAll('img'), function(i) { i.src = resolveUrl(origin, i.getAttribute('src')); });

    var readable = new Readability();
    readable.setSkipLevel(3);
    saxParser(doc.body/*doc.childNodes[document.childNodes.length-1]*/, readable);
    var article = readable.getArticle();
    return article.html;
  }


  function matitaHtml(doc) {
    var parent = getBestParent(doc);
    var content = '';
    if (parent) {
      sanitizeNode(parent);
      content = parent.innerHTML;
    }
    return content;
  }



  function sanitizeUrl(url) {
    var urlParts = url.split('?');
    if (urlParts.length == 1)
      return url;
    urlParts[1] = (urlParts[1] || '')
      .split('&')
      .filter(function(exp) { return exp.indexOf('utm_') !== 0; })
      .join('&');

    return urlParts[1].length ? urlParts.join('?') : urlParts[0];
  }


  function getFileName(title) {
    var now = new Date();
    return now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + '-' +
      (title || '').toLowerCase().replace(/^\W*(.*)\W*$/, '$1').replace(/\W+/g, '-') +
      '.html';
  }

  function formatDate(date) {
    date = date || new Date();
    return date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes()) + ':' +
      pad(date.getSeconds());
  }

  function pad(num) {
    return ('0' + num).substr(-2);
  }

  function getMetaValue(name, nameAttr) {
    nameAttr = nameAttr || 'name';
    var meta = doc.querySelector('head meta[' + nameAttr + '="' + name + '"]');
    return meta && meta.getAttribute('content') || null;
  }


  function getBestParent(doc) {
    var parent = doc.querySelector('article main');

    if (parent)
      return parent;

    parent = doc.querySelector('article');
    if (parent)
      return parent;

    parent = null;

    var ps = doc.querySelectorAll('p,br');
    var parents = [];
    var contents = [];
    var maxLength = 0;
    var maxIndex = 0;
    var parent;

    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      parent = p.parentNode;
      
      if (parent.tagName == 'FORM')
        continue;
      if (parent.className.toLowerCase().match(/(\b|-|_)comments\b/i))
        continue;
      
      var parentIndex = parents.indexOf(parent);
      if (parentIndex == -1) {
        parentIndex = parents.length;
        parents.push(parent);
      }

      var parentPs = contents[parentIndex];
      if (!parentPs)
        parentPs = contents[parentIndex] = [];
      
      parentPs.push(p);
      if (parentPs.length > maxLength) {
        maxLength = parentPs.length;
        maxIndex = parentIndex;
      }
    }

    parent = parents[maxIndex];
    return parent;
  }


  function sanitizeNode(node) {
    var nodes, n, i;

    // remove some html elements
    nodes = node.querySelectorAll('script, style, header, footer, form');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      n.parentNode.removeChild(n);
    }

    // remove unrelated divs
    var uselessRegexp = /\b(ad|comments|meta|social|shar(er?|ing)|related|sidebar)\b/;
    nodes = node.querySelectorAll('*');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (uselessRegexp.test(n.className) || uselessRegexp.test(n.id))
        n.parentNode.removeChild(n);
    }

    // remove empty divs
    nodes = node.getElementsByTagName('div');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (!n.lastChild)
        n.parentNode.removeChild(n);
    }

    
    // normalize links
    nodes = node.getElementsByTagName('a');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (!n.href) // do not normalize local links
        continue;
      else if (n.host == location.host && n.pathname == location.pathname && n.search == location.search)
        n.href = n.hash;
      else
        n.href = n.href;
    }

    // normalize img urls
    var a = doc.createElement('a');
    nodes = node.getElementsByTagName('img');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var src = n.getAttribute('data-src') || n.src;
      a.href = src;
      n.src = a.href;
    }

    // normalize iframes urls
    nodes = node.getElementsByTagName('iframe');
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var src = n.getAttribute('data-src') || n.src;
      a.href = src;
      n.src = a.href;
    }

    removeAttributes(node);
  }


  function removeAttributes(node) {
    var tags = Array.prototype.concat.apply([node], node.querySelectorAll('*'));
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];
      tag.removeAttribute('style');
    }
  }
}