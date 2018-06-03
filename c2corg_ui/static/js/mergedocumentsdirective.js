goog.provide('app.mergeDocumentsDirective');

goog.require('app');

/**
 * This directive is used to manage the dialog to merge documents.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.mergeDocumentsDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppMergeDocumentsController',
    controllerAs: 'mergeCtrl',
    templateUrl: '/static/partials/mergedocuments.html',
    bindToController: {
      'module': '<'
    }
  };
};

app.module.directive('appMergeDocuments', app.mergeDocumentsDirective);
