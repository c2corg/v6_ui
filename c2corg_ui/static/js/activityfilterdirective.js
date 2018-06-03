goog.provide('app.activityFilterDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.activityFilterDirective = function() {
  return {
    restrict: 'E',
    controller: 'appActivityFilterController',
    controllerAs: 'afilterCtrl',
    bindToController: {
      'activities': '<',
      'documents': '<'
    },
    templateUrl: '/static/partials/activityfilter.html'
  };
};
app.module.directive('appActivityFilter', app.activityFilterDirective);
