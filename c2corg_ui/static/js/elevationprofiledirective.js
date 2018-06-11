/**
 * @module app.elevationProfileDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appElevationProfileController',
    controllerAs: 'elevationProfileCtrl',
    templateUrl: '/static/partials/elevationprofile.html'
  };
};

appBase.module.directive('appElevationProfile', exports);


export default exports;
