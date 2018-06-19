/**
 * @module app.mapDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display a pre-configured map in v6_ui pages.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    scope: {
      'edit': '=appMapEdit',
      'drawType': '@c2cMapDrawType',
      'disableWheel': '=appMapDisableWheel',
      'advancedSearch': '=appMapAdvancedSearch',
      'zoom': '@c2cMapZoom',
      'defaultMapFilter': '=appMapDefaultMapFilter',
      'featureCollection': '=appMapFeatureCollection',
      'showRecenterTools': '=appMapShowRecenterTools',
      'showBiodivsportsAreas': '=appMapShowBiodivsportsAreas',
      'biodivSportsActivities': '=appMapBiodivsportsActivities'
    },
    controller: 'AppMapController as mapCtrl',
    bindToController: true,
    templateUrl: '/static/partials/map/map.html'
  };
};

appBase.module.directive('appMap', exports);


export default exports;
