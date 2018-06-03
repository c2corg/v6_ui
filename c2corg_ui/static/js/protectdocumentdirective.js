goog.provide('app.protectDocumentDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.protectDocumentDirective = function() {
  return {
    restrict: 'A',
    controller: 'appProtectDocumentController',
    controllerAs: 'protectCtrl',
    templateUrl: '/static/partials/protectdocument.html'
  };
};
app.module.directive('appProtectDocument', app.protectDocumentDirective);
