goog.provide('app.mapSwitchDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.mapSwitchDirective = function() {
  return {
    restrict: 'E',
    controller: 'appMapSwitchController',
    controllerAs: 'MapswitchCtrl',
    templateUrl: '/static/partials/mapswitch.html'
  };
};
app.module.directive('appMapSwitch', app.mapSwitchDirective);
