goog.provide('app.mapDirective');

goog.require('app');


/**
 * This directive is used to display a pre-configured map in v6_ui pages.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.mapDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'edit': '=appMapEdit',
      'drawType': '@appMapDrawType',
      'disableWheel': '=appMapDisableWheel',
      'advancedSearch': '=appMapAdvancedSearch',
      'zoom': '@appMapZoom',
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

app.module.directive('appMap', app.mapDirective);
