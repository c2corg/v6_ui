/**
 * @module app.preferencesDirective
 */
import appBase from './index.js';

/**
 * Directive managing the user preferences.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'appPreferencesController',
    controllerAs: 'prefCtrl'
  };
};

appBase.module.directive('appPreferences', exports);


export default exports;
