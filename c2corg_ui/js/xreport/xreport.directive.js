/**
 * Directive managing the xreport.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const XreportDirective = () => {
  return {
    restrict: 'A',
    scope: {
      'xreportId': '@c2cXreport',
      'lang': '@c2cXreportLang'
    },
    controller: 'XreportController',
    controllerAs: 'xrCtrl',
    bindToController: true
  };
};

export default XreportDirective;
