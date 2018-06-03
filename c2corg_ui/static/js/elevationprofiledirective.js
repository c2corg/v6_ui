goog.provide('app.elevationProfileDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.elevationProfileDirective = function() {
  return {
    restrict: 'E',
    controller: 'appElevationProfileController',
    controllerAs: 'elevationProfileCtrl',
    templateUrl: '/static/partials/elevationprofile.html'
  };
};
app.module.directive('appElevationProfile', app.elevationProfileDirective);
