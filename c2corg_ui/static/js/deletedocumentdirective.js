/**
 * @module app.deleteDocumentDirective
 */
import appBase from './index.js';

/**
 * This directive is used to manage the dialog to delete a document.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteDocumentController',
    controllerAs: 'deldocCtrl',
    templateUrl: '/static/partials/deletedocument.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

appBase.module.directive('appDeleteDocument', exports);


export default exports;
