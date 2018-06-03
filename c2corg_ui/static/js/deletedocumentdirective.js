goog.provide('app.deleteDocumentDirective');

goog.require('app');

/**
 * This directive is used to manage the dialog to delete a document.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.deleteDocumentDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteDocumentController',
    controllerAs: 'deldocCtrl',
    templateUrl: '/static/partials/deletedocument.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

app.module.directive('appDeleteDocument', app.deleteDocumentDirective);
