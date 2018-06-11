/**
 * @module app.mergeDocumentsDirective
 */
import appBase from './index.js';

/**
 * This directive is used to manage the dialog to merge documents.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppMergeDocumentsController',
    controllerAs: 'mergeCtrl',
    templateUrl: '/static/partials/mergedocuments.html',
    bindToController: {
      'module': '<'
    }
  };
};

appBase.module.directive('appMergeDocuments', exports);


export default exports;
