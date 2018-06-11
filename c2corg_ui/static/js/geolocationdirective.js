/**
 * @module app.geolocationDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display a "center on my position" button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
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

appBase.module.directive('appGeolocation', exports);


export default exports;
