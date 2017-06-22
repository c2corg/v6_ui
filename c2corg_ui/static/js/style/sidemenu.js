goog.provide('app.sidemenu');

goog.require('app');

/**
 * @export
 */
app.sidemenu = function() {
  /* handle sidebar hiding */
  var body = $('body');
  var content = $('.page-content');

  $('.menu-open-close').on('click', function() {
    body.toggleClass('menu-toggled');
    if (body.hasClass('menu-toggled')) {
      content.prepend('<div id="content-toggled">');
    } else {
      $('#content-toggled').remove();
    }
  });

  $(window).resize(function() {
    if (window.innerWidth >= 1100 && body.hasClass('menu-toggled')) {
      body.toggleClass('menu-toggled', false);
      $('#content-toggled').remove();
    }
  });
  content.on('click', '#content-toggled', function() {
    body.toggleClass('menu-toggled', false);
    $('#content-toggled').remove();
  });
};
