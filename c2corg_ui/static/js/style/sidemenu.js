goog.provide('app.sidemenu');

goog.require('app');

/**
 * @export
 */
app.sidemenu = function() {
  $('.menu-open-close').click(function() {
    if ($('#sidemenu').hasClass('menu-open')) {
      $('#sidemenu').removeClass('menu-open');
      $('#sidemenu').addClass('menu-closed');
    } else {
      $('#sidemenu').removeClass('menu-closed');
      $('#sidemenu').addClass('menu-open');
    }
  });

  $('.menu-open-close').click(function() {
    $('.menu-open-close.menu').toggleClass('is-active');
  });
};
