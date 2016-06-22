goog.provide('app.searchFiltersDirective');
goog.provide('app.SearchFiltersController');

goog.require('app');
goog.require('app.utils');
goog.require('ngeo.Debounce');
goog.require('ngeo.Location');


/**
 * This directive is used to integrate a criterias form in the advanced search
 * page. See also {app.advancedSearchDirective}.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.searchFiltersDirective = function() {
  return {
    restrict: 'A',
    controller: 'appSearchFiltersController',
    bindToController: true,
    scope: true,
    controllerAs: 'filtersCtrl',
    link: function(scope, element, attrs, ctrl) {
      // FIXME On some screen sizes, the dropdown menu is too large and is
      // hidden within documents-list-section because it's too small. Given
      // that this menu is inside, it will not be shown entirely...
      // If someone can fix it using CSS only, you're da real MVP !
      element.on('click', '.dropdown-toggle', function() {
        $(this).next().css({
          position: 'fixed',
          top: $(this).offset().top + 30,
          left: $(this).offset().left - 10
        });
      });

      // This prevents to 'jump' or 'stutter' on phone - before, if you first
      // opened more-filters and scrolled, it would unfold filters on whole
      // page and make a stutter. Now it overflows.
      if (window.innerWidth < app.constants.SCREEN.SMARTPHONE) {
        $('.more-filters-btn, .search-filters-btn, .less-filters-btn').click(function() {
          $('.filters').toggleClass('filters-phone');
        });
      }
    }
  };
};


app.module.directive('appSearchFilters', app.searchFiltersDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {Object} advancedSearchFilters Config of the filters.
 * @constructor
 * @ngInject
 * @export
 */
app.SearchFiltersController = function($scope, ngeoLocation, ngeoDebounce,
    advancedSearchFilters) {

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
   * @type {Object}
   * @private
   */
  this.config_ = advancedSearchFilters;

  /**
   * @type {Object}
   * @export
   */
  this.filters = {};

  /**
   * @type {boolean}
   * @private
   */
  this.loading_ = true;

  // Fill the filters according to the loaded URL parameters
  var keys = this.location_.getParamKeys().filter(function(x) {
    return app.SearchFiltersController.IGNORED_FILTERS.indexOf(x) === -1;
  });
  for (var i = 0, n = keys.length; i < n; i++) {
    this.getFilterFromPermalink_(keys[i]);
  }

  // Deep watch is used here because we need to watch the list filters as well
  // which a simple $watch or $watchCollection does not. Might cause
  // perf/memory issues though...
  this.scope_.$watch(function() {
    return this.filters;
  }.bind(this), ngeoDebounce(
      this.handleFiltersChange_.bind(this),
      500, /* invokeApply */ true),
    /* deep watch */ true
  );
};


/**
 * @const
 * @type {Array.<string>}
 */
app.SearchFiltersController.IGNORED_FILTERS = ['bbox', 'offset', 'limit'];


/**
 * @param {string} key Filter key.
 * @private
 */
app.SearchFiltersController.prototype.getFilterFromPermalink_ = function(key) {
  var val = this.location_.getParam(key);
  if (val === '') {
    return;
  }
  if (key === 'qa') {
    this.createListFilter_(key, val);
  } else if (key in this.config_) {
    // Filters are described in the 'advancedSearchFilters' module value
    // set in c2corg_ui/templates/*/index.html.
    switch (this.config_[key]['type']) {
      case 'list':
        this.createListFilter_(key, val);
        break;
      case 'range':
        this.createRangeFilter_(key, val);
        break;
      default:
        break;
    }
  } else {
    this.filters[key] = val;
  }
};


/**
 * @param {string} key Filter key.
 * @param {string} val Filter value.
 * @private
 */
app.SearchFiltersController.prototype.createListFilter_ = function(key, val) {
  this.filters[key] = val.split(',');
};


/**
 * @param {string} key Filter key.
 * @param {string} val Filter value.
 * @private
 */
app.SearchFiltersController.prototype.createRangeFilter_ = function(key, val) {
  this.filters[key] = val.split(',').map(function(x) {
    return parseInt(x, 10);
  });
};


/**
 * @private
 */
app.SearchFiltersController.prototype.handleFiltersChange_ = function() {
  // ignore the initial $watchCollection triggering (at loading time)
  if (!this.loading_) {
    this.location_.updateParams(this.filters);
    this.location_.deleteParam('offset');
    this.scope_.$root.$emit('searchFilterChange');
  } else {
    this.loading_ = false;
  }
};


/**
 * @param {string} prop Where to save the value.
 * @param {string} val Value to save.
 * @param {jQuery.Event | goog.events.Event} event click
 * @export
 */
app.SearchFiltersController.prototype.selectOption = function(prop, val, event) {
  // Don't close the menu after selecting an option
  event.stopPropagation();
  var checked = app.utils.pushToArray(this.filters, prop, val, event);
  if (!checked && this.filters[prop].length === 0) {
    delete this.filters[prop];
    this.location_.deleteParam(prop);
  }
};


app.module.controller('appSearchFiltersController', app.SearchFiltersController);
