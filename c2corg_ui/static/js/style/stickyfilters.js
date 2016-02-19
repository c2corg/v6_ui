goog.provide('app.stickyFilters');

goog.require('app');


/**
 * @export
 */
app.stickyFilters = function() {

  // show/hide filters on click, only available on phone
  $('.show-documents-filters-phone').click(function() {
    $('.filters').toggle();
  });

  $('.documents-list-section').scroll(function() {
    var scrollMax = $('.simple-filters').height() + 30;

    // if you scroll down and there is no sticky bar, add it
    if ($(this).scrollTop() > scrollMax && $('.sticky-filters-btn-container').length === 0) {
      $('.more-filters-btn-container').addClass('sticky-filters-btn-container');
      $('#moreFilters').addClass('sticky-filters-moreFilters');
      $('.simple-filters').clone().prependTo('#moreFilters');
      adaptFiltersWidth();
      //show only part of filters on small screen
      if (window.innerWidth < app.constants.SCREEN.SMARTPHONE) {
        $('#moreFilters').addClass('overflow-scroll');
      }
    }
    //when you scroll up, remove the cloned filters and the sticky classes
    if ($(this).scrollTop() < scrollMax && $('.sticky-filters-btn-container').length > 0 && $('.simple-filters').length === 2) {
      var simpleFilters = $('#moreFilters .simple-filters').clone();
      $('.more-filters-btn-container').removeClass('sticky-filters-btn-container');
      $('#moreFilters').removeClass('overflow-scroll sticky-filters-moreFilters');
      $('.simple-filters').remove();
      $('.filters').prepend(simpleFilters);
      adaptFiltersWidth();
    }
  });
  // on resize, show filters if they have been hidden on smartphone
  $(window).resize(function() {
    adaptFiltersWidth();
    if (window.innerWidth > app.constants.SCREEN.SMARTPHONE && $('.filters').css('display') === 'none') {
      $('.filters').show();
    }
  });

  function adaptFiltersWidth() {
    var width = $('.documents-list-section').width();
    // sticky bar and filters width = filters width
    if ($('#moreFilters').hasClass('sticky-filters-moreFilters')) {
      $('#moreFilters, .more-filters-btn-container').css('width', parseInt(width, 10));
    } else {
      $('#moreFilters, .more-filters-btn-container').css('width', parseInt($('.filters').width(), 10));
    }
  }
};
