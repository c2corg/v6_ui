/**
 * This directive is used to manage the history form.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const VersionsDirective = () => {
  return {
    restrict: 'A',
    scope: true,
    controller: 'VersionsController',
    controllerAs: 'versionsCtrl',
    bindToController: {
      'documentType': '@',
      'documentId': '@',
      'lang': '@'
    }
  };
};

export default VersionsDirective;
