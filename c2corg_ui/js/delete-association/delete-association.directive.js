/**
 * @return {angular.Directive} Directive Definition Object.
 */
const DeleteAssociationDirective = () => {
  return {
    restrict: 'E',
    controller: 'DeleteAssociationController',
    controllerAs: 'unassociateCtrl',
    bindToController: {
      'parentId': '=',
      'childId': '=',
      'childDoctype': '@'
    },
    link(scope, element, attrs, controller) {
      $(element).on('click', (e) => {
        const modal = controller.openModal_();
        modal.result.then((res) => {
          if (res) {
            controller.unassociateDocument_(e);
          }
        });
      });
    },
    template: '<span class="glyphicon glyphicon-trash"></span>'
  };
};

export default DeleteAssociationDirective;
