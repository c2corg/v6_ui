goog.provide('app.PaginationController');
goog.provide('app.paginationDirective');

goog.require('app');
goog.require('ngeo.Location');


/**
 * This directive is used to display pagination buttons
 * in the search result list.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.paginationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppPaginationController',
    controllerAs: 'pageCtrl',
    bindToController: true,
    templateUrl: '/static/partials/pagination.html'
  };
};

app.module.directive('appPagination', app.paginationDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 */
app.PaginationController = function($scope, ngeoLocation) {

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
app.PaginationController.MAX_RESULT_OFFSET = 10000;

/**
 * @param {Object} event
 * @param {Array.<ol.Feature>} features Search results features.
 * @param {number} total Total number of results.
 * @param {boolean} recenter
 * @private
 */
app.PaginationController.prototype.handleSearchChange_ = function(event,
    features, total, recenter) {
  this.total = total;
  this.offset = this.location_.getFragmentParamAsInt('offset') || 0;
  // don't show the "Go to last page" button if the offset is above
  // maxResultOffset_, or the API will return an error
  this.showGoToLastPage =
    this.total <= app.PaginationController.MAX_RESULT_OFFSET;
};


/**
 * @export
 */
app.PaginationController.prototype.goToFirst = function() {
  this.location_.deleteFragmentParam('offset');
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};


/**
 * @export
 */
app.PaginationController.prototype.goToPrev = function() {
  var prevOffset = this.offset - this.limit;
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
app.PaginationController.prototype.goToNext = function() {
  var nextOffset = this.offset + this.limit;
  this.location_.updateFragmentParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};


/**
 * @export
 */
app.PaginationController.prototype.goToLast = function() {
  var nextOffset = this.total - (this.total % this.limit);
  this.location_.updateFragmentParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchFilterChange');
  this.scrollToTop_();
};

/**
 * @private
 */
app.PaginationController.prototype.scrollToTop_ = function() {
  document.querySelector('.documents-list-section').scrollTop = 0;
};


app.module.controller('AppPaginationController', app.PaginationController);
