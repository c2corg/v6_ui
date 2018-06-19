import template from './delete-document.html';

/**
 * This directive is used to manage the dialog to delete a document.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const DeleteDocumentDirective = () => {
  return {
    restrict: 'E',
    controller: 'DeleteDocumentController',
    controllerAs: 'deldocCtrl',
    template,
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

export default DeleteDocumentDirective;
