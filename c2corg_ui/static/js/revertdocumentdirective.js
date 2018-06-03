goog.provide('app.revertDocumentDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.revertDocumentDirective = function() {
  return {
    restrict: 'A',
    controller: 'appRevertDocumentController',
    controllerAs: 'revertCtrl'
  };
};

app.module.directive('appRevertDocument', app.revertDocumentDirective);
