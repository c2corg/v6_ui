/**
 * @module app.cotometerDirective
 */
import appBase from './index.js';

/**
 * This directive is used to manage the dialog of cotometer
 * cotometerRating function was developed and made available with the support of BLMS http://paleo.blms.free.fr
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppCotometerController',
    controllerAs: 'cotmetCtrl',
    templateUrl: '/static/partials/cotometer.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

appBase.module.directive('appCotometer', exports);


export default exports;
