goog.provide('app.stickyFiltersDirective');
goog.provide('app.StickyFiltersController');

goog.require('app');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.stickyFiltersDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppStickyFiltersController as stickyCtrl',
    link: function(scope, el, attrs, ctrl) {
      // show/hide filters on click, only available on phone
      $('.show-documents-filters-phone').click(() => {
        $('form[app-search-filters]').toggleClass('show');
        $('.map-right').removeClass('show');
      });
      // hide/show map on mobile
      $('.toggle-map').click(() => {
        $('.map-right').toggleClass('show');
      });
      // on mobile, clicking on the 'all filters' btn will scroll up to the top
      // because opening the whole filters list would only show you the bottom end.
      $('.orange-btn.more-filters-btn').click(() => {
        if (window.innerWidth < app.constants.SCREEN.SMARTPHONE) {
          $('.documents-list-section').scrollTop(0);
        }
      });


      $('.documents-list-section').scroll(() => {
        const scrollMax = $('.simple-filters').height() + 30;
        const documentsListTop = $('.documents-list-section').scrollTop();
        // if you scroll down and there is no sticky bar, add it
        if (documentsListTop > scrollMax && $('.sticky-filters-btn-container').length === 0) {
          ctrl.addStickyFilters_();
        }
        //when you scroll up, remove the cloned filters and the sticky classes
        if (documentsListTop === 0 && $('.sticky-filters-btn-container').length > 0) {
          ctrl.removeStickyFilters_();
        }
      });
      // on resize, show filters if they have been hidden on smartphone
      $(window).resize(() => {
        ctrl.adaptFiltersWidth_();
      });
    }
  };
};

app.module.directive('appStickyFilters', app.stickyFiltersDirective);


/**
 * @constructor
 * @struct
 */
app.StickyFiltersController = function() {};


/**
 * if you 1) click on 'all filters' 2) and haven't scrolled yet - #moreFilters will have
 * will have aria-expanded => don't add sticky filters! it prevents jumping and looks more natural.
 * @private
 */
app.StickyFiltersController.prototype.addStickyFilters_ = function() {
  if ($('#moreFilters[aria-expanded="true"]').length === 0) {
    $('.more-filters-btn-container').addClass('sticky-filters-btn-container');
    $('#moreFilters').addClass('sticky-filters-moreFilters');
    this.adaptFiltersWidth_();
  }
};


/**
 * @private
 */
app.StickyFiltersController.prototype.removeStickyFilters_ = function() {
  $('.more-filters-btn-container').removeClass('sticky-filters-btn-container');
  $('#moreFilters').removeClass('overflow-scroll sticky-filters-moreFilters');
  this.adaptFiltersWidth_();
};


/**
 * @private
 */
app.StickyFiltersController.prototype.adaptFiltersWidth_ = function() {
  const width = $('.documents-list-section').width();
  // sticky bar and filters width = filters width
  if ($('#moreFilters').hasClass('sticky-filters-moreFilters')) {
    $('#moreFilters, .more-filters-btn-container').css('width', parseInt(width, 10));
  } else {
    $('#moreFilters, .more-filters-btn-container').css('width', parseInt($('.filters').width(), 10));
  }
};

app.module.controller('AppStickyFiltersController', app.StickyFiltersController);
