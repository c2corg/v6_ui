/**
 * @module app.versionsDirective
 */
import appBase from './index.js';

/**
 * This directive is used to manage the history form.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appVersionsController',
    controllerAs: 'versionsCtrl',
    bindToController: {
      'documentType': '@',
      'documentId': '@',
      'lang': '@'
    }
  };
};

appBase.module.directive('appVersions', exports);


export default exports;
