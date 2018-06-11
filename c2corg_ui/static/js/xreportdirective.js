/**
 * @module app.xreportDirective
 */
import appBase from './index.js';

/**
 * Directive managing the xreport.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    scope: {
      'xreportId': '@appXreport',
      'lang': '@appXreportLang'
    },
    controller: 'appXreportController',
    controllerAs: 'xrCtrl',
    bindToController: true
  };
};


appBase.module.directive('appXreport', exports);


export default exports;
