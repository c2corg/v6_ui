goog.provide('app.versionsDirective');

goog.require('app');


/**
 * This directive is used to manage the history form.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.versionsDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appVersionsController',
    controllerAs: 'versionsCtrl',
    bindToController: {
      'documentType': '@',
      'documentId': '@',
      'lang': '@'
    }
  };
};

app.module.directive('appVersions', app.versionsDirective);
