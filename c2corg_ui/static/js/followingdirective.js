goog.provide('app.followingDirective');

goog.require('app');


/**
 * Directive managing the list of followed users.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.followingDirective = function() {
  return {
    restrict: 'A',
    controller: 'appFollowingController',
    controllerAs: 'flCtrl'
  };
};
