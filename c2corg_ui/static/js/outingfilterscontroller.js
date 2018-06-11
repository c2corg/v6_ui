/**
 * @module app.OutingFiltersController
 */
import appBase from './index.js';
import appSearchFiltersController from './SearchFiltersController.js';
import olBase from 'ol.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @extends {app.SearchFiltersController}
 * @ngInject
 */
const exports = function($scope, ngeoLocation, ngeoDebounce,
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

  appSearchFiltersController.call(this, $scope, ngeoLocation, ngeoDebounce,
    advancedSearchFilters);
};

olBase.inherits(exports, appSearchFiltersController);


/**
 * @param {string} key Filter key.
 * @override
 * @public
 */
exports.prototype.setFilterFromPermalink = function(key) {
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
    appSearchFiltersController.prototype.setFilterFromPermalink.call(this, key);
  }
};


/**
 * @override
 * @export
 */
exports.prototype.clear = function() {
  this.resetDates_();
  appSearchFiltersController.prototype.clear.call(this);
};


/**
 * @param {string} filterName Name of the filter param.
 * @export
 */
exports.prototype.setDate = function(filterName) {
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
exports.prototype.formatDate_ = function(date) {
  return window.moment(date).format('YYYY-MM-DD');
};


/**
 * @private
 */
exports.prototype.updateMinMaxDates_ = function() {
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
exports.prototype.resetDates_ = function() {
  this.dates = [];
  this.dateMaxStart = new Date();
  this.dateMaxEnd = new Date();
  this.dateMinEnd = null;
};


appBase.module.controller('appOutingFiltersController', exports);


export default exports;
