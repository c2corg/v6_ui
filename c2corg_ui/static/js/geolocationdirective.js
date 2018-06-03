goog.provide('app.geolocationDirective');

goog.require('app');


/**
 * This directive is used to display a "center on my position" button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.geolocationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppGeolocationController',
    controllerAs: 'geoCtrl',
    bindToController: true,
    scope: {
      'map': '=appGeolocationMap'
    },
    templateUrl: '/static/partials/map/geolocation.html'
  };
};

app.module.directive('appGeolocation', app.geolocationDirective);
