import template from './map.html';

/**
 * This directive is used to display a pre-configured map in v6_ui pages.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const MapDirective = () => {
  return {
    restrict: 'E',
    scope: {
      'edit': '=c2cMapEdit',
      'drawType': '@c2cMapDrawType',
      'disableWheel': '=c2cMapDisableWheel',
      'advancedSearch': '=c2cMapAdvancedSearch',
      'zoom': '@c2cMapZoom',
      'defaultMapFilter': '=c2cMapDefaultMapFilter',
      'featureCollection': '=c2cMapFeatureCollection',
      'showRecenterTools': '=c2cMapShowRecenterTools',
      'showBiodivsportsAreas': '=c2cMapShowBiodivsportsAreas',
      'biodivSportsActivities': '=c2cMapBiodivsportsActivities'
    },
    controller: 'MapController as mapCtrl',
    bindToController: true,
    template
  };
};

export default MapDirective;
