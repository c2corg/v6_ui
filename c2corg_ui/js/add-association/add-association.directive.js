/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
const AddAssociationDirective = $compile => {
  'ngInject';

  const template = dataset => {
    return '<c2c-simple-search c2c-select="addCtrl.associate(doc)" ' +
      'ignore-document-id="addCtrl.parentId" ' +
      'dataset="' + dataset + '"></c2c-simple-search>';
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
