goog.provide('app.deleteAssociationDirective');

goog.require('app');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.deleteAssociationDirective = function() {
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

app.module.directive('appDeleteAssociation', app.deleteAssociationDirective);
