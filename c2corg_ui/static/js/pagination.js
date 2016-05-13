goog.provide('app.PaginationController');
goog.provide('app.paginationDirective');

goog.require('app');


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
 * @export
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
   * @type {number}
   * @export
   */
  this.offset = ngeoLocation.getParamAsInt('offset') || 0;

  /**
   * @type {number}
   * @export
   */
  this.limit = ngeoLocation.getParamAsInt('limit') || 30;

  this.scope_.$root.$on('searchFeaturesChange',
    this.handleSearchChange_.bind(this));
};


/**
 * @param {Object} event
 * @param {Array.<ol.Feature>} features Search results features.
 * @param {number} total Total number of results.
 * @private
 */
app.PaginationController.prototype.handleSearchChange_ = function(event,
    features, total) {
  this.total = total;
  this.offset = this.location_.getParamAsInt('offset') || 0;
};


/**
 * @export
 */
app.PaginationController.prototype.goToFirst = function() {
  this.location_.deleteParam('offset');
  this.scope_.$root.$emit('searchPageChange');
};


/**
 * @export
 */
app.PaginationController.prototype.goToPrev = function() {
  var prevOffset = this.offset - this.limit;
  if (prevOffset > 0) {
    this.location_.updateParams({'offset': prevOffset});
  } else {
    this.location_.deleteParam('offset');
  }
  this.scope_.$root.$emit('searchPageChange');
};


/**
 * @export
 */
app.PaginationController.prototype.goToNext = function() {
  var nextOffset = this.offset + this.limit;
  this.location_.updateParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchPageChange');
};


/**
 * @export
 */
app.PaginationController.prototype.goToLast = function() {
  var nextOffset = this.total - (this.total % this.limit);
  this.location_.updateParams({'offset': nextOffset});
  this.scope_.$root.$emit('searchPageChange');
};


app.module.controller('AppPaginationController', app.PaginationController);
