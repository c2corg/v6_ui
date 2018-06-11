/**
 * @module app.SearchFiltersController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @ngInject
 */
const exports = function($scope, ngeoLocation, ngeoDebounce,
  advancedSearchFilters) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {ngeo.Location}
   * @public
   */
  this.location = ngeoLocation;

  /**
   * @type {Object}
   * @public
   */
  this.config = advancedSearchFilters;

  /**
   * @type {Object}
   * @export
   */
  this.filters;

  /**
   * @type {number}
   * @export
   */
  this.filtersNb = 0;

  /**
   * @type {Array.<string>}
   * @export
   */
  this.orientations = [];

  /**
   * @type {boolean}
   * @private
   */
  this.loading_ = true;

  /**
   * @type {Object}
   * @private
   */
  this.checkboxes_ = {};

  // Fill the filters according to the loaded URL parameters
  this.setFilters_();

  // Deep watch is used here because we need to watch the list filters as well
  // which a simple $watch or $watchCollection does not. Might cause
  // perf/memory issues though...
  this.scope_.$watch(() => {
    return this.filters;
  }, ngeoDebounce(
    this.handleFiltersChange_.bind(this),
    500, /* invokeApply */ true),
    /* deep watch */ true
  );
  this.scope_.$watch(() => {
    return this.checkboxes_;
  }, ngeoDebounce(
    this.handleCheckboxesChange_.bind(this),
    700, /* invokeApply */ true),
    /* deep watch */ true
  );

  this.scope_.$root.$on('searchFilterChange', (event, loadPrefs) => {
    if (loadPrefs) {
      this.loading_ = true;
      this.setFilters_();
    }
  });
};


/**
 * @const
 * @type {Array.<string>}
 */
exports.IGNORED_FILTERS = ['bbox', 'offset', 'limit'];


/**
 * @private
 */
exports.prototype.setFilters_ = function() {
  this.filters = {};
  const keys = this.location.getFragmentParamKeys().filter((x) => {
    return exports.IGNORED_FILTERS.indexOf(x) === -1;
  });
  for (let i = 0, n = keys.length; i < n; i++) {
    this.setFilterFromPermalink(keys[i]);
  }
};


/**
 * @param {string} key Filter key.
 * @public
 */
exports.prototype.setFilterFromPermalink = function(key) {
  const val = this.location.getFragmentParam(key);
  if (val === '') {
    return;
  }
  if (key === 'qa') {
    this.filters[key] = val.split(',');
  } else if (key in this.config) {
    // Filters are described in the 'advancedSearchFilters' module value
    // set in c2corg_ui/templates/*/index.html.
    switch (this.config[key]['type']) {
      case 'list':
        this.filters[key] = val.split(',');
        break;
      case 'range':
        this.filters[key] = val.split(',').map((x) => {
          return parseInt(x, 10);
        });
        break;
      case 'orientations':
        this.filters[key] = val.split(',');
        // initialize the orientations SVG
        this.orientations = this.filters[key];
        break;
      default:
        break;
    }
  } else {
    this.filters[key] = val;
  }
};


/**
 * @private
 */
exports.prototype.handleFiltersChange_ = function() {
  // ignore the initial $watchCollection triggering (at loading time)
  if (!this.loading_) {
    this.location.updateFragmentParams(this.filters);
    this.location.deleteFragmentParam('offset');
    this.scope_.$root.$emit('searchFilterChange');
  } else {
    this.loading_ = false;
  }
  for (const key in this.filters) {
    if (key in this.config && this.config[key]['type'] === 'list') {
      // make sure the checkboxes buffer is up to date
      this.checkboxes_[key] = this.filters[key];
    }
  }
  goog.asserts.assert(this.filters);
  this.filtersNb = Object.keys(this.filters).length;
};


/**
 * @private
 */
exports.prototype.handleCheckboxesChange_ = function() {
  // Synchronize filters with checkboxes
  for (const prop in this.checkboxes_) {
    if (this.checkboxes_[prop].length) {
      this.filters[prop] = this.checkboxes_[prop];
    } else {
      delete this.filters[prop];
      this.location.deleteFragmentParam(prop);
    }
  }
};


/**
 * @param {string} prop Where to save the value.
 * @param {string} val Value to save.
 * @param {jQuery.Event | goog.events.Event} event click
 * @export
 */
exports.prototype.selectOption = function(prop, val, event) {
  // Don't close the menu after selecting an option
  event.stopPropagation();
  appUtils.pushToArray(this.checkboxes_, prop, val, event);
};


/**
 * @export
 */
exports.prototype.clear = function() {
  for (const key in this.filters) {
    this.location.deleteFragmentParam(key);
  }
  this.filters = {};
  this.checkboxes_ = {};
  this.orientations = [];
  this.scope_.$root.$emit('searchFilterClear');
};


/**
 * @param {string} orientation
 * @param {app.SearchFiltersController} ctrl
 * @param {goog.events.Event | jQuery.Event} e
 * @param {string} filterName Name of the filter param in the URL.
 * @export
 */
exports.prototype.toggleOrientation = function(orientation,
  ctrl, e, filterName) {
  if (this.orientations.indexOf(orientation) === -1) {
    this.orientations.push(orientation);
  } else {
    this.orientations = this.orientations.filter((val) => {
      return val !== orientation;
    });
  }
  if (this.orientations.length) {
    this.filters[filterName] = this.orientations;
  } else {
    delete this.filters[filterName];
    this.location.deleteFragmentParam(filterName);
  }
};


/**
 * @param {string} filterName Name of the filter param.
 * @export
 */
exports.prototype.toggleCheckbox = function(filterName) {
  if (filterName in this.filters) {
    delete this.filters[filterName];
    this.location.deleteFragmentParam(filterName);
  } else {
    this.filters[filterName] = true;
  }
};


appBase.module.controller('appSearchFiltersController', exports);


export default exports;
