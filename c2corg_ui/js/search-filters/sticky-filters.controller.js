/**
 * @constructor
 * @struct
 */
export default class StickFiltersController {
  constructor() {
    'ngInject';
  }

  /**
   * if you 1) click on 'all filters' 2) and haven't scrolled yet - #moreFilters will have
   * will have aria-expanded => don't add sticky filters! it prevents jumping and looks more natural.
   * @private
   */
  addStickyFilters_() {
    if ($('#moreFilters[aria-expanded="true"]').length === 0) {
      $('.more-filters-btn-container').addClass('sticky-filters-btn-container');
      $('#moreFilters').addClass('sticky-filters-moreFilters');
      this.adaptFiltersWidth_();
    }
  }


  /**
   * @private
   */
  removeStickyFilters_() {
    $('.more-filters-btn-container').removeClass('sticky-filters-btn-container');
    $('#moreFilters').removeClass('overflow-scroll sticky-filters-moreFilters');
    this.adaptFiltersWidth_();
  }


  /**
   * @private
   */
  adaptFiltersWidth_() {
    const width = $('.documents-list-section').width();
    // sticky bar and filters width = filters width
    if ($('#moreFilters').hasClass('sticky-filters-moreFilters')) {
      $('#moreFilters, .more-filters-btn-container').css('width', parseInt(width, 10));
    } else {
      $('#moreFilters, .more-filters-btn-container').css('width', parseInt($('.filters').width(), 10));
    }
  }
}
