/**
 * @module app.revertDocumentDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'appRevertDocumentController',
    controllerAs: 'revertCtrl'
  };
};

appBase.module.directive('appRevertDocument', exports);


export default exports;
