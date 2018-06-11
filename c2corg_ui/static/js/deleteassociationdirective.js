/**
 * @module app.deleteAssociationDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} Directive Definition Object.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteAssociationController',
    controllerAs: 'unassociateCtrl',
    bindToController: {
      'parentId': '=',
      'childId': '=',
      'childDoctype': '@'
    },
    link: function(scope, element, attrs, controller) {
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

appBase.module.directive('appDeleteAssociation', exports);


export default exports;
