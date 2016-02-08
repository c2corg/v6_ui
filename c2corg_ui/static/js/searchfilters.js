goog.provide('app.searchFiltersDirective');
goog.provide('app.SearchFiltersController');

goog.require('app');


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
app.SearchFiltersController.prototype.selectOption = function(option,
    optionCategory, e) {

  // Don't close the menu after selecting an option
  e.stopPropagation();

  // Shorthand
  var optionCat = this[optionCategory];
  var target = $(e.currentTarget);
  var checkbox = target.find('input');
  
  // If this property doesn't exit in the scope, create an array and
  // push the selected option.
  if (!optionCat) {
    optionCat = this[optionCategory] = [];
  }
  this.updateFilterArray_(optionCat, target, checkbox, option);
};


/**
 * Push/remove the selected option into the scope property (scope_[optionCat])
 * and check/uncheck the checkbox depending if the option is already
 * in the array or not.
 *
 * @param {Array<string>} optionCat
 * @param {jQuery} target
 * @param {jQuery} checkbox
 * @param {string} option
 * @private
 */
app.SearchFiltersController.prototype.updateFilterArray_ = function(
    optionCat, target, checkbox, option) {

  if (optionCat.indexOf(option) === -1) {
    optionCat.push(option);
    checkbox.prop('checked', true);
    target.addClass('option-selected');
  } else {
    optionCat.splice(optionCat.indexOf(option), 1);
    checkbox.prop('checked', false);
    target.removeClass('option-selected');
  }
};


app.module.controller('appSearchFiltersController', app.SearchFiltersController);
