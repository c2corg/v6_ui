goog.provide('app.SliderController');
goog.provide('app.sliderDirective');

goog.require('app');


/**
 * This directive displays a slider control used for instance in the advanced
 * search filters form.
 *
 * @return {angular.Directive} The directive specs.
 */
app.sliderDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppSliderController',
    controllerAs: 'sliderCtrl',
    bindToController: true,
    scope: true,
    template:
        '<input type="range" class="range-between" ng-model="sliderCtrl.model" ' +
               'data-slider-tooltip="hide">' +
        '<span class="slider-min-max">' +
          '<p class="min-value">{{sliderCtrl.min}} m</p>' +
          '<p class="max-value">{{sliderCtrl.max}} m</p>' +
        '</span>',
    link: function(scope, el, attr, ctrl) {
      var min = parseInt(attr['min'], 10) || app.SliderController.MIN;
      var max = parseInt(attr['max'], 10) || app.SliderController.MAX;
      // TODO; get unit (meters, days, etc.) from attributes
      el.find('.range-between').slider({min: min, max: max, value: [min, max]});
      el.on('slide', function(slideEvt) {
        ctrl.min = slideEvt.value[0];
        ctrl.max = slideEvt.value[1];
        scope.$apply();
      });
    }
  }
};

app.module.directive('appSlider', app.sliderDirective);


/**
 * @param {angular.Attributes} $attrs Attributes.
 * @constructor
 * @export
 * @ngInject
 */
app.SliderController = function($attrs) {

  /**
   * @type {number}
   * @export
   */
  this.min = parseInt($attrs['min'], 10) || app.SliderController.MIN;

  /**
   * @type {number}
   * @export
   */
  this.max = parseInt($attrs['max'], 10) || app.SliderController.MAX;

  /**
   * @type {Array.<number>}
   * @export
   */
  this.model = $attrs['model'];
};


/**
 * @const
 * @type {number}
 */
app.SliderController.MIN = 0;


/**
 * @const
 * @type {number}
 */
app.SliderController.MAX = 9999;


app.module.controller('AppSliderController', app.SliderController);
