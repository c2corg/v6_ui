goog.provide('app.OutingFiltersController');

goog.require('app');
goog.require('app.SearchFiltersController');


/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @extends {app.SearchFiltersController}
 * @ngInject
 * @export
 */
app.OutingFiltersController = function($scope, ngeoLocation, ngeoDebounce,
    advancedSearchFilters) {

  goog.base(this, $scope, ngeoLocation, ngeoDebounce, advancedSearchFilters);

  /**
   * @type {Array.<Date>}
   * @export
   */
  this.dates = [];

  /**
   * Start cannot be after today nor end_date.
   * @type {Date}
   * @export
   */
  this.dateMaxStart = new Date();

  /**
   * The end date cannot be before start nor today.
   * @type {Date}
   * @export
   */
  this.dateMaxEnd = new Date();

  /**
   * The end date cannot be before start.
   * @type {?Date}
   * @export
   */
  this.dateMinEnd = null;

};
goog.inherits(app.OutingFiltersController, app.SearchFiltersController);


/**
 * @param {string} key Filter key.
 * @override
 * @public
 */
app.OutingFiltersController.prototype.getFilterFromPermalink = function(key) {
  if (key in this.config && this.config[key]['type'] === 'date') {
    var val = this.location.getFragmentParam(key);
    if (val === '') {
      return;
    }
    var dates = val.split(',');
    dates.forEach(function(date) {
      this.dates.push(window.moment(date).toDate());
    }.bind(this));
    this.filters[key] = dates;
    this.updateMinMaxDates_();
  } else {
    goog.base(this, 'getFilterFromPermalink', key);
  }
};


/**
 * @override
 * @export
 */
app.OutingFiltersController.prototype.clear = function() {
  this.resetDates_();
  goog.base(this, 'clear');
};


/**
 * @param {string} filterName Name of the filter param.
 * @export
 */
app.OutingFiltersController.prototype.setDate = function(filterName) {
  this.dates = this.dates.filter(function(date) {
    return date !== null;
  });
  if (this.dates.length) {
    this.updateMinMaxDates_();
    this.filters[filterName] = this.dates.map(this.formatDate_);
  } else {
    this.resetDates_();
    delete this.filters[filterName];
    this.location.deleteParam(filterName);
  }
};


/**
 * @param {Date} date
 * @return {string}
 * @private
 */
app.OutingFiltersController.prototype.formatDate_ = function(date) {
  return window.moment(date).format('YYYY-MM-DD');
};


/**
 * @private
 */
app.OutingFiltersController.prototype.updateMinMaxDates_ = function() {
  var nb_dates = this.dates.length;
  if (nb_dates > 0) {
    this.dateMaxStart = nb_dates > 1 ? this.dates[1] : this.dateMaxStart;
    this.dateMinEnd = this.dates[0];
  } else {
    this.resetDates_();
  }
};


/**
 * @private
 */
app.OutingFiltersController.prototype.resetDates_ = function() {
  this.dates = [];
  this.dateMaxStart = new Date();
  this.dateMaxEnd = new Date();
  this.dateMinEnd = null;
};


app.module.controller('appOutingFiltersController', app.OutingFiltersController);
