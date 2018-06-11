/**
 * @module app.protectDocumentDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'appProtectDocumentController',
    controllerAs: 'protectCtrl',
    templateUrl: '/static/partials/protectdocument.html'
  };
};

appBase.module.directive('appProtectDocument', exports);


export default exports;
