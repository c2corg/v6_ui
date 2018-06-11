/**
 * @module app.mapSwitchDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appMapSwitchController',
    controllerAs: 'MapswitchCtrl',
    templateUrl: '/static/partials/mapswitch.html'
  };
};

appBase.module.directive('appMapSwitch', exports);


export default exports;
