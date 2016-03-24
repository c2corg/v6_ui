goog.provide('app.searchFiltersDirective');
goog.provide('app.SearchFiltersController');

goog.require('app');
goog.require('app.utils');

/**
 * Provides the 'searchFiltersDirective' directive, which is used to enrich
 * filtering components in the documents listing pages.
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
    controllerAs: 'searchFiltersCtrl',
    link: function(scope, element, attrs, ctrl) {
      // Init sliders
      $('.range-between').slider({min: 0, max: 9999, value: [0, 9999]});
      var elevationFilter = $('#elevation-filter');
      var heightFilter = $('#height-filter');

      // Update elevation slider values
      elevationFilter.on('slide', function(slideEvt) {
        ctrl.elevation.min = slideEvt.value[0];
        ctrl.elevation.max = slideEvt.value[1];
        scope.$apply();
      });

      // Update height diff slider values
      heightFilter.on('slide', function(slideEvt) {
        ctrl.height_diff_up.min = slideEvt.value[0];
        ctrl.height_diff_up.max = slideEvt.value[1];
        scope.$apply();
      });
      //on some screen sizes, the dropdown menu is too large and is hidden within documents-list-section
      // because it's to small. Given that this menu is inside, it will not be show entirely...
      // If someone can fix it using CSS only, you're da real MVP !
      element.on('click', '.dropdown-toggle', function() {
        $(this).next().css({position: 'fixed', top: $(this).offset().top + 30, left: $(this).offset().left - 10})
      });

      // this prevents to 'jump' or 'stutter' on phone - before, if you first opened more-filters
      // and scrolled, it would unfold filters on whole page and make a stutter. Now it overflows.
      if (window.innerWidth < app.constants.SCREEN.SMARTPHONE) {
        $('.more-filters-btn, .search-filters-btn, .less-filters-btn').click(function() {
          $('.filters').toggleClass('filters-phone');
        });
      }
    }
  }
};


app.module.directive('appSearchFilters', app.searchFiltersDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @constructor
 * @ngInject
 * @export
 */
app.SearchFiltersController = function($scope, $element, $attrs) {


  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  // FIXME: not generic to all document types
  // Init filters object
  /**
   * @type {Array<string>}
   * @export
   */
  this.activities = [];


  /**
   * @type {Array<string>}
   * @export
   */
  this.waypoint_types = [];


  /**
   * @type {string}
   * @export
   */
  this.lang;


  /**
   * @type {string}
   * @export
   */
  this.around;


  /**
   * @type {Object}
   * @export
   */
  this.height_diff_up = {min: 0, max: 9999};

  /**
   * @type {Object}
   * @export
   */
  this.elevation = {min : 0, max: 9999};
};


/**
 * @param {string} option name
 * @param {string} optionCategory category
 * @param {jQuery.Event | goog.events.Event} e click
 * @export
 */
app.SearchFiltersController.prototype.selectOption = function(option, optionCategory, e) {

  // Don't close the menu after selecting an option
  e.stopPropagation();

  var checkbox = $(e.currentTarget).find('input');
  var pushed = app.utils.pushToArray(this, optionCategory, option);

  if (pushed) {
    $(e.currentTarget).addClass('option-selected');
    checkbox.prop('checked', true);
  } else {
    $(e.currentTarget).removeClass('option-selected');
    checkbox.prop('checked', false);
  }
};

app.module.controller('appSearchFiltersController', app.SearchFiltersController);
