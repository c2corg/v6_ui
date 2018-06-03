goog.provide('app.xreportDirective');

goog.require('app');


/**
 * Directive managing the xreport.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.xreportDirective = function() {
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


app.module.directive('appXreport', app.xreportDirective);
