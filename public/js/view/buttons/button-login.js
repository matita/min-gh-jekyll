util.listen(document.body)
  .on('click', '.gh-login', function(e) {
    MyLinks.logIn();
  })
  .on('click', '.gh-logout', function(e) {
    MyLinks.logOut();
  });