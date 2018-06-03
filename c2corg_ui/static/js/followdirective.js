goog.provide('app.followDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.followDirective = function() {
  return {
    restrict: 'E',
    controller: 'appFollowController',
    controllerAs: 'followCtrl',
    bindToController: {
      'docId': '=appFollowId'
    },
    templateUrl: '/static/partials/follow.html'
  };
};
app.module.directive('appFollow', app.followDirective);
