/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
const AddAssociationDirective = ($compile) => {
  'ngInject';

  const template = dataset => {
    return '<app-simple-search app-select="addCtrl.associate(doc)" ' +
      'ignore-document-id="addCtrl.parentId" ' +
      'dataset="' + dataset + '"></app-simple-search>';
  };

  return {
    restrict: 'E',
    controller: 'AddAssociationController',
    controllerAs: 'addCtrl',
    bindToController: {
      'parentId': '=',
      'parentDoctype': '@'
    },
    link(scope, element, attrs) {
      element.html(template(attrs.dataset));
      $compile(element.contents())(scope);
    }
  };
};

export default AddAssociationDirective;
