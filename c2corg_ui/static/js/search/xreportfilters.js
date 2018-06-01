goog.provide('app.XreportFiltersController');

goog.require('app');
goog.require('app.SearchFiltersController');
goog.require('ol');


/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @extends {app.SearchFiltersController}
 * @ngInject
 */
app.XreportFiltersController = function($scope, ngeoLocation, ngeoDebounce,
  advancedSearchFilters) {

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

  app.SearchFiltersController.call(this, $scope, ngeoLocation, ngeoDebounce, advancedSearchFilters);
};

ol.inherits(app.XreportFiltersController, app.SearchFiltersController);


/**
 * @param {string} key Filter key.
 * @override
 * @public
 */
app.XreportFiltersController.prototype.setFilterFromPermalink = function(key) {
  if (key in this.config && this.config[key]['type'] === 'date') {
    const val = this.location.getFragmentParam(key);
    if (val === '') {
      return;
    }
    const dates = val.split(',');
    dates.forEach((date) => {
      this.dates.push(window.moment(date).toDate());
    });
    this.filters[key] = dates;
    this.updateMinMaxDates_();
  } else {
    app.SearchFiltersController.prototype.setFilterFromPermalink.call(this, key);
  }
};


/**
 * @override
 * @export
 */
app.XreportFiltersController.prototype.clear = function() {
  this.resetDates_();
  app.SearchFiltersController.prototype.clear.call(this);
};


/**
 * @param {string} filterName Name of the filter param.
 * @export
 */
app.XreportFiltersController.prototype.setDate = function(filterName) {
  this.dates = this.dates.filter((date) => {
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
app.XreportFiltersController.prototype.formatDate_ = function(date) {
  return window.moment(date).format('YYYY-MM-DD');
};


/**
 * @private
 */
app.XreportFiltersController.prototype.updateMinMaxDates_ = function() {
  const nb_dates = this.dates.length;
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
app.XreportFiltersController.prototype.resetDates_ = function() {
  this.dates = [];
  this.dateMaxStart = new Date();
  this.dateMaxEnd = new Date();
  this.dateMinEnd = null;
};

app.module.controller('appXreportFiltersController', app.XreportFiltersController);
