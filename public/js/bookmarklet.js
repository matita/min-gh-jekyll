var meta;
var title = getMetaValue('title') ||
  getMetaValue('og:title', 'property') ||
  document.title;
var description = getMetaValue('description') ||
  getMetaValue('og:description', 'property');
var url = window.location.href;


var filename = getFileName(title);
var frontMatter = '---' +
  '\r\ntitle: "' + title + '"' +
  '\r\ndescription: "' + description + '"' +
  '\r\nlink: "' + url + '"' +
  '\r\nsaved: "' + formatDate() + '"' +
  '\r\n---';


var originalHtml = getContentHtml();
console.log('containers', html);
//window.open('https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=_posts/' + encodeURIComponent(filename) + '.md&value=' + encodeURIComponent(frontMatter));

var w = window.contentW || window.open();
var wDoc = w.document;

wDoc.head.innerHTML = '<style>' +
  'body { font-family: Georgia; font-size: 20px; max-width: 700px; margin: 0 auto; color: #555; line-height: 1.8; padding: 2em 10px; }' + 
  'h1, h2, h3, h4, h5, h6 { font-family: Arial, Helvetica, sans-serif; line-height: 1.2; }' +
  'a[href] { color: #6a9fb5; text-decoration: none; }' +
  'a[href]:hover { text-decoration: underline; }' +
  'img { max-width: 100%; height: auto; display: block; margin: 0 auto; text-align: center }' +
  'iframe { max-width: 100%; display: block; margin: 0 auto; }' +
  'pre { padding: 1em; background: #eee; font-size: 14px; overflow: auto; }' +
  'blockquote { border-left: 5px solid #ddd; margin-left: 0; padding-left: 1em; }' +
  '#html-content { width: 100%; display: block; height: 100px; }' +
  '</style>';

var html = '<h1 style="border-bottom: 1px solid #eee; padding-bottom: 1em; margin-bottom: 1em;">' + title + '</h1>' +
  '<p><button id="save-btn">Save</button></p>' +
  '<p>' +
  '<textarea id="html-content" onclick="this.select()"></textarea>' +
  'Copy above text and <a href="https://github.com/matita/min-gh-jekyll/new/gh-pages/?filename=' + encodeURIComponent('_posts/' + filename) + '&value=' + encodeURIComponent(frontMatter) + '">Save post</a>' +
  '</p>' +
  '<hr>' +
  originalHtml;


wDoc.body.innerHTML = html;
wDoc.getElementById('html-content').value = originalHtml;


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
  var meta = document.querySelector('head meta[' + nameAttr + '="' + name + '"]');
  return meta && meta.getAttribute('content') || null;
}


function getContentHtml() {
  var parent = getBestParent();
  var html;

  if (parent) {
    var cln = parent.cloneNode(true);
    sanitizeNode(cln);

    html = cln.innerHTML;
  }

  return html;
}


function getBestParent() {
  var ps = document.getElementsByTagName('p');
  var parents = [];
  var contents = [];
  var maxLength = 0;
  var maxIndex = 0;

  for (var i = 0; i < ps.length; i++) {
    var p = ps[i];
    var parent = p.parentNode;
    
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

  var parent = parents[maxIndex];
  return parent;
}


function sanitizeNode(node) {
  var nodes, n, i;

  // remove scripts
  nodes = node.getElementsByTagName('script');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    n.parentNode.removeChild(n);
  }

  // remove styles
  nodes = node.getElementsByTagName('style');
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
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
  var a = document.createElement('a');
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
}


// GitHub API
!function(e,t){"use strict";if("function"==typeof define&&define.amd)define(["xmlhttprequest","js-base64"],function(n,o){return e.Github=t(n.XMLHttpRequest,o.Base64.encode)});else if("object"==typeof module&&module.exports)"undefined"!=typeof window?module.exports=t(window.XMLHttpRequest,window.btoa):module.exports=t(require("xmlhttprequest").XMLHttpRequest,require("js-base64").Base64.encode);else{var n=function(t){return e.btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,function(e,t){return String.fromCharCode("0x"+t)}))};e.Github=t(e.XMLHttpRequest,n)}}(this,function(e,t){"use strict";var n=function(o){var s=o.apiUrl||"https://api.github.com",i=n._request=function(n,i,u,r,c,a){function l(){var e=i.indexOf("//")>=0?i:s+i;if(e+=/\?/.test(e)?"&":"?",u&&"object"==typeof u&&["GET","HEAD","DELETE"].indexOf(n)>-1)for(var t in u)u.hasOwnProperty(t)&&(e+="&"+encodeURIComponent(t)+"="+encodeURIComponent(u[t]));return e.replace(/(&timestamp=\d+)/,"")+("undefined"!=typeof window?"&timestamp="+(new Date).getTime():"")}var f=new e;if(f.open(n,l(),!a),a||(f.onreadystatechange=function(){4===this.readyState&&(this.status>=200&&this.status<300||304===this.status?r(null,c?this.responseText:this.responseText?JSON.parse(this.responseText):!0,this):r({path:i,request:this,error:this.status}))}),c?f.setRequestHeader("Accept","application/vnd.github.v3.raw+json"):(f.dataType="json",f.setRequestHeader("Accept","application/vnd.github.v3+json")),f.setRequestHeader("Content-Type","application/json;charset=UTF-8"),o.token||o.username&&o.password){var h=o.token?"token "+o.token:"Basic "+t(o.username+":"+o.password);f.setRequestHeader("Authorization",h)}return u?f.send(JSON.stringify(u)):f.send(),a?f.response:void 0},u=n._requestAllPages=function(e,t){var n=[];!function o(){i("GET",e,null,function(s,i,u){if(s)return t(s);n.push.apply(n,i);var r=(u.getResponseHeader("link")||"").split(/\s*,\s*/g),c=null;r.forEach(function(e){c=/rel="next"/.test(e)?e:c}),c&&(c=(/<(.*)>/.exec(c)||[])[1]),c?(e=c,o()):t(s,n)})}()};return n.User=function(){this.repos=function(e,t){1===arguments.length&&"function"==typeof arguments[0]&&(t=e,e={}),e=e||{};var n="/user/repos",o=[];o.push("type="+encodeURIComponent(e.type||"all")),o.push("sort="+encodeURIComponent(e.sort||"updated")),o.push("per_page="+encodeURIComponent(e.per_page||"1000")),e.page&&o.push("page="+encodeURIComponent(e.page)),n+="?"+o.join("&"),i("GET",n,null,t)},this.orgs=function(e){i("GET","/user/orgs",null,e)},this.gists=function(e){i("GET","/gists",null,e)},this.notifications=function(e,t){1===arguments.length&&"function"==typeof arguments[0]&&(t=e,e={}),e=e||{};var n="/notifications",o=[];if(e.all&&o.push("all=true"),e.participating&&o.push("participating=true"),e.since){var s=e.since;s.constructor===Date&&(s=s.toISOString()),o.push("since="+encodeURIComponent(s))}if(e.before){var u=e.before;u.constructor===Date&&(u=u.toISOString()),o.push("before="+encodeURIComponent(u))}e.page&&o.push("page="+encodeURIComponent(e.page)),o.length>0&&(n+="?"+o.join("&")),i("GET",n,null,t)},this.show=function(e,t){var n=e?"/users/"+e:"/user";i("GET",n,null,t)},this.userRepos=function(e,t){u("/users/"+e+"/repos?type=all&per_page=1000&sort=updated",t)},this.userStarred=function(e,t){u("/users/"+e+"/starred?type=all&per_page=1000",function(e,n){t(e,n)})},this.userGists=function(e,t){i("GET","/users/"+e+"/gists",null,t)},this.orgRepos=function(e,t){u("/orgs/"+e+"/repos?type=all&&page_num=1000&sort=updated&direction=desc",t)},this.follow=function(e,t){i("PUT","/user/following/"+e,null,t)},this.unfollow=function(e,t){i("DELETE","/user/following/"+e,null,t)},this.createRepo=function(e,t){i("POST","/user/repos",e,t)}},n.Repository=function(e){function o(e,t){return e===l.branch&&l.sha?t(null,l.sha):void a.getRef("heads/"+e,function(n,o){l.branch=e,l.sha=o,t(n,o)})}var s,u=e.name,r=e.user,c=e.fullname,a=this;s=c?"/repos/"+c:"/repos/"+r+"/"+u;var l={branch:null,sha:null};this.getRef=function(e,t){i("GET",s+"/git/refs/"+e,null,function(e,n,o){return e?t(e):void t(null,n.object.sha,o)})},this.createRef=function(e,t){i("POST",s+"/git/refs",e,t)},this.deleteRef=function(t,n){i("DELETE",s+"/git/refs/"+t,e,function(e,t,o){n(e,t,o)})},this.createRepo=function(e,t){i("POST","/user/repos",e,t)},this.deleteRepo=function(t){i("DELETE",s,e,t)},this.listTags=function(e){i("GET",s+"/tags",null,function(t,n,o){return t?e(t):void e(null,n,o)})},this.listPulls=function(e,t){e=e||{};var n=s+"/pulls",o=[];"string"==typeof e?o.push("state="+e):(e.state&&o.push("state="+encodeURIComponent(e.state)),e.head&&o.push("head="+encodeURIComponent(e.head)),e.base&&o.push("base="+encodeURIComponent(e.base)),e.sort&&o.push("sort="+encodeURIComponent(e.sort)),e.direction&&o.push("direction="+encodeURIComponent(e.direction)),e.page&&o.push("page="+e.page),e.per_page&&o.push("per_page="+e.per_page)),o.length>0&&(n+="?"+o.join("&")),i("GET",n,null,function(e,n,o){return e?t(e):void t(null,n,o)})},this.getPull=function(e,t){i("GET",s+"/pulls/"+e,null,function(e,n,o){return e?t(e):void t(null,n,o)})},this.compare=function(e,t,n){i("GET",s+"/compare/"+e+"..."+t,null,function(e,t,o){return e?n(e):void n(null,t,o)})},this.listBranches=function(e){i("GET",s+"/git/refs/heads",null,function(t,n,o){return t?e(t):void e(null,n.map(function(e){return e.ref.replace(/^refs\/heads\//,"")}),o)})},this.getBlob=function(e,t){i("GET",s+"/git/blobs/"+e,null,t,"raw")},this.getCommit=function(e,t,n){i("GET",s+"/git/commits/"+t,null,function(e,t,o){return e?n(e):void n(null,t,o)})},this.getSha=function(e,t,n){return t&&""!==t?void i("GET",s+"/contents/"+t+(e?"?ref="+e:""),null,function(e,t,o){return e?n(e):void n(null,t.sha,o)}):a.getRef("heads/"+e,n)},this.getStatuses=function(e,t){i("GET",s+"/statuses/"+e,null,t)},this.getTree=function(e,t){i("GET",s+"/git/trees/"+e,null,function(e,n,o){return e?t(e):void t(null,n.tree,o)})},this.postBlob=function(e,n){e="string"==typeof e?{content:e,encoding:"utf-8"}:{content:t(e),encoding:"base64"},i("POST",s+"/git/blobs",e,function(e,t){return e?n(e):void n(null,t.sha)})},this.updateTree=function(e,t,n,o){var u={base_tree:e,tree:[{path:t,mode:"100644",type:"blob",sha:n}]};i("POST",s+"/git/trees",u,function(e,t){return e?o(e):void o(null,t.sha)})},this.postTree=function(e,t){i("POST",s+"/git/trees",{tree:e},function(e,n){return e?t(e):void t(null,n.sha)})},this.commit=function(t,o,u,r){var c=new n.User;c.show(null,function(n,c){if(n)return r(n);var a={message:u,author:{name:e.user,email:c.email},parents:[t],tree:o};i("POST",s+"/git/commits",a,function(e,t){return e?r(e):(l.sha=t.sha,void r(null,t.sha))})})},this.updateHead=function(e,t,n){i("PATCH",s+"/git/refs/heads/"+e,{sha:t},function(e){n(e)})},this.show=function(e){i("GET",s,null,e)},this.contributors=function(e,t){t=t||1e3;var n=this;i("GET",s+"/stats/contributors",null,function(o,s,i){return o?e(o):void(202===i.status?setTimeout(function(){n.contributors(e,t)},t):e(o,s,i))})},this.contents=function(e,t,n){t=encodeURI(t),i("GET",s+"/contents"+(t?"/"+t:""),{ref:e},n)},this.fork=function(e){i("POST",s+"/forks",null,e)},this.listForks=function(e){i("GET",s+"/forks",null,e)},this.branch=function(e,t,n){2===arguments.length&&"function"==typeof arguments[1]&&(n=t,t=e,e="master"),this.getRef("heads/"+e,function(e,o){return e&&n?n(e):void a.createRef({ref:"refs/heads/"+t,sha:o},n)})},this.createPullRequest=function(e,t){i("POST",s+"/pulls",e,t)},this.listHooks=function(e){i("GET",s+"/hooks",null,e)},this.getHook=function(e,t){i("GET",s+"/hooks/"+e,null,t)},this.createHook=function(e,t){i("POST",s+"/hooks",e,t)},this.editHook=function(e,t,n){i("PATCH",s+"/hooks/"+e,t,n)},this.deleteHook=function(e,t){i("DELETE",s+"/hooks/"+e,null,t)},this.read=function(e,t,n){i("GET",s+"/contents/"+encodeURI(t)+(e?"?ref="+e:""),null,function(e,t,o){return e&&404===e.error?n("not found",null,null):e?n(e):void n(null,t,o)},!0)},this.remove=function(e,t,n){a.getSha(e,t,function(o,u){return o?n(o):void i("DELETE",s+"/contents/"+t,{message:t+" is removed",sha:u,branch:e},n)})},this["delete"]=this.remove,this.move=function(e,t,n,s){o(e,function(o,i){a.getTree(i+"?recursive=true",function(o,u){u.forEach(function(e){e.path===t&&(e.path=n),"tree"===e.type&&delete e.sha}),a.postTree(u,function(n,o){a.commit(i,o,"Deleted "+t,function(t,n){a.updateHead(e,n,function(e){s(e)})})})})})},this.write=function(e,n,o,u,r,c){"undefined"==typeof c&&(c=r,r={}),a.getSha(e,encodeURI(n),function(a,l){var f={message:u,content:"undefined"==typeof r.encode||r.encode?t(o):o,branch:e,committer:r&&r.committer?r.committer:void 0,author:r&&r.author?r.author:void 0};a&&404!==a.error||(f.sha=l),i("PUT",s+"/contents/"+encodeURI(n),f,c)})},this.getCommits=function(e,t){e=e||{};var n=s+"/commits",o=[];if(e.sha&&o.push("sha="+encodeURIComponent(e.sha)),e.path&&o.push("path="+encodeURIComponent(e.path)),e.since){var u=e.since;u.constructor===Date&&(u=u.toISOString()),o.push("since="+encodeURIComponent(u))}if(e.until){var r=e.until;r.constructor===Date&&(r=r.toISOString()),o.push("until="+encodeURIComponent(r))}e.page&&o.push("page="+e.page),e.perpage&&o.push("per_page="+e.perpage),o.length>0&&(n+="?"+o.join("&")),i("GET",n,null,t)}},n.Gist=function(e){var t=e.id,n="/gists/"+t;this.read=function(e){i("GET",n,null,e)},this.create=function(e,t){i("POST","/gists",e,t)},this["delete"]=function(e){i("DELETE",n,null,e)},this.fork=function(e){i("POST",n+"/fork",null,e)},this.update=function(e,t){i("PATCH",n,e,t)},this.star=function(e){i("PUT",n+"/star",null,e)},this.unstar=function(e){i("DELETE",n+"/star",null,e)},this.isStarred=function(e){i("GET",n+"/star",null,e)}},n.Issue=function(e){var t="/repos/"+e.user+"/"+e.repo+"/issues";this.list=function(e,n){var o=[];for(var s in e)e.hasOwnProperty(s)&&o.push(encodeURIComponent(s)+"="+encodeURIComponent(e[s]));u(t+"?"+o.join("&"),n)},this.comment=function(e,t,n){i("POST",e.comments_url,{body:t},function(e,t){n(e,t)})}},n.Search=function(e){var t="/search/",n="?q="+e.query;this.repositories=function(e,o){i("GET",t+"repositories"+n,e,o)},this.code=function(e,o){i("GET",t+"code"+n,e,o)},this.issues=function(e,o){i("GET",t+"issues"+n,e,o)},this.users=function(e,o){i("GET",t+"users"+n,e,o)}},n};return n.getIssues=function(e,t){return new n.Issue({user:e,repo:t})},n.getRepo=function(e,t){if(t)return new n.Repository({user:e,name:t});var o=e;return new n.Repository({fullname:o})},n.getUser=function(){return new n.User},n.getGist=function(e){return new n.Gist({id:e})},n.getSearch=function(e){return new n.Search({query:e})},n});

// Save on GitHub
var saveBtn = wDoc.getElementById('save-btn');
saveBtn.onclick = function() {
  var userName = 'matita';
  var repoName = 'min-gh-jekyll';
  var branch = 'gh-pages';
  var commitMessage = 'Saved from ' + url;
  var authToken = prompt('GitHub auth token');

  if (!authToken)
    return;

  var github = new Github({
    token: authToken,
    auth: 'oauth'
  });

  var repo = github.getRepo(userName, repoName);
  var saveBtnLabel = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = 'Saving...';
  repo.write(branch, '_posts/' + filename, originalHtml, commitMessage, function(err) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = saveBtnLabel;
    
    if (err)
      alert('Error while saving: ' + err);
    else {
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Saved';
      setTimeout(function() { w.close(); }, 2000);
    }
  });
}