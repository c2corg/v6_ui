/**
 * @module app.mailinglistsDirective
 */
import appBase from './index.js';

/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'appMailinglistsController',
    controllerAs: 'mlCtrl'
  };
};


appBase.module.directive('appMailinglists', exports);


export default exports;
