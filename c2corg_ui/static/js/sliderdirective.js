/**
 * @module app.sliderDirective
 */
import appBase from './index.js';

/**
 * This directive displays a slider control used for instance in the advanced
 * search filters form.
 *
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppSliderController',
    controllerAs: 'sliderCtrl',
    bindToController: true,
    scope: {
      'filter': '@',
      'filtersList': '=',
      'valuesList': '='
    },
    template:
        '<input type="range" class="range-between" data-slider-tooltip="hide">' +
        '<span class="slider-min-max">' +
          '<p class="min-value">{{sliderCtrl.dispMin | translate}} {{sliderCtrl.unit | translate}}</p>' +
          '<p class="max-value">{{sliderCtrl.dispMax | translate}} {{sliderCtrl.unit | translate}}</p>' +
        '</span>',
    link: function(scope, el, attr, ctrl) {
      el.find('.range-between').slider({
        min: ctrl.boundaries[0],
        max: ctrl.boundaries[1],
        value: [ctrl.min, ctrl.max],
        step: ctrl.step
      });
    }
  };
};

appBase.module.directive('appSlider', exports);


export default exports;
