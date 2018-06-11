/**
 * @module app.PaginationController
 */
import appBase from './index.js';

/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 */
const exports = function($scope, ngeoLocation) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {number}
   * @export
   */
  this.total = 0;

  /**
   * @type {boolean}
   * @export
   */
  this.showGoToLastPage = true;

  /**
   * @type {number}
   * @export
   */
  this.offset = ngeoLocation.getFragmentParamAsInt('offset') || 0;

  /**
   * @type {number}
   * @export
   */
  this.limit = ngeoLocation.getFragmentParamAsInt('limit') || 30;

  this.scope_.$root.$on('searchFeaturesChange',
    this.handleSearchChange_.bind(this));
};

/**
 * @const
 * @type {number}
 */
exports.MAX_RESULT_OFFSET = 10000;

/**
 * @param {Object} event
 * @param {Array.<ol.Feature>} features Search results features.
 * @param {number} total Total number of results.
 * @param {boolean} recenter
 * @private
 */
exports.prototype.handleSearchChange_ = function(event,
  features, total, recenter) {
  this.total = total;
  this.offset = this.location_.getFragmentParamAsInt('offset') || 0;
  // don't show the "Go to last page" button if the offset is above
  // maxResultOffset_, or the API will return an error
  this.showGoToLastPage =
    this.total <= exports.MAX_RESULT_OFFSET;
};


/**
 * @export
 */
exports.prototype.goToFirst = function() {
  this.location_.deleteFragmentParam('offset');
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};


/**
 * @export
 */
exports.prototype.goToPrev = function() {
  const prevOffset = this.offset - this.limit;
  if (prevOffset > 0) {
    this.location_.updateFragmentParams({'offset': prevOffset});
  } else {
    this.location_.deleteFragmentParam('offset');
  }
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};


/**
 * @export
 */
exports.prototype.goToNext = function() {
  const nextOffset = this.offset + this.limit;
  this.location_.updateFragmentParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};


/**
 * @export
 */
exports.prototype.goToLast = function() {
  const nextOffset = this.total - (this.total % this.limit);
  this.location_.updateFragmentParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};

/**
 * @private
 */
exports.prototype.scrollToTop_ = function() {
  document.querySelector('.documents-list-section').scrollTop = 0;
};


appBase.module.controller('AppPaginationController', exports);


export default exports;
