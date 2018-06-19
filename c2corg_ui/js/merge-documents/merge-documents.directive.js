import template from './merge-documents.html';

/**
 * This directive is used to manage the dialog to merge documents.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const MergeDocumentsDirective = () => {
  return {
    restrict: 'E',
    controller: 'MergeDocumentsController',
    controllerAs: 'mergeCtrl',
    template,
    bindToController: {
      'module': '<'
    }
  };
};

export default MergeDocumentsDirective;
