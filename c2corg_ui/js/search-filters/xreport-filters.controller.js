import SearchFiltersController from './search-filters.controller';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @extends {app.SearchFiltersController}
 * @ngInject
 */
export default class XreportFilterController extends SearchFiltersController {
  constructor($scope, ngeoLocation, advancedSearchFilters, moment) {
    'ngInject';

    super($scope, ngeoLocation, advancedSearchFilters);

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
  }


  /**
   * @param {string} key Filter key.
   * @override
   * @public
   */
  setFilterFromPermalink(key) {
    if (key in this.config && this.config[key]['type'] === 'date') {
      const val = this.location.getFragmentParam(key);
      if (val === '') {
        return;
      }
      const dates = val.split(',');
      dates.forEach((date) => {
        this.dates.push(this.moment(date).toDate());
      });
      this.filters[key] = dates;
      this.updateMinMaxDates_();
    } else {
      super.setFilterFromPermalink(key);
    }
  }


  /**
   * @override
   * @export
   */
  clear() {
    this.resetDates_();
    super.clear();
  }


  /**
   * @param {string} filterName Name of the filter param.
   * @export
   */
  setDate(filterName) {
    this.dates = this.dates.filter(date => date !== null);
    if (this.dates.length) {
      this.updateMinMaxDates_();
      this.filters[filterName] = this.dates.map(this.formatDate_);
    } else {
      this.resetDates_();
      delete this.filters[filterName];
      this.location.deleteParam(filterName);
    }
  }


  /**
   * @param {Date} date
   * @return {string}
   * @private
   */
  formatDate_(date) {
    return this.moment(date).format('YYYY-MM-DD');
  }


  /**
   * @private
   */
  updateMinMaxDates_() {
    const nb_dates = this.dates.length;
    if (nb_dates > 0) {
      this.dateMaxStart = nb_dates > 1 ? this.dates[1] : this.dateMaxStart;
      this.dateMinEnd = this.dates[0];
    } else {
      this.resetDates_();
    }
  }


  /**
   * @private
   */
  resetDates_() {
    this.dates = [];
    this.dateMaxStart = new Date();
    this.dateMaxEnd = new Date();
    this.dateMinEnd = null;
  }
}
