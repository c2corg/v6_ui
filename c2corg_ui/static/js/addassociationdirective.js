goog.provide('app.addAssociationDirective');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.addAssociationDirective = function($compile) {

  const template = function(dataset) {
    return '<app-simple-search app-select="addCtrl.associate(doc)" ' +
      'ignore-document-id="addCtrl.parentId" ' +
      'dataset="' + dataset + '"></app-simple-search>';
  };

  return {
    restrict: 'E',
    controller: 'AppAddAssociationController',
    controllerAs: 'addCtrl',
    bindToController: {
      'parentId': '=',
      'parentDoctype': '@'
    },
    link: function(scope, element, attrs) {
      element.html(template(attrs.dataset));
      $compile(element.contents())(scope);
    }
  };
};

app.module.directive('appAddAssociation', app.addAssociationDirective);
