goog.provide('app.MapController');
goog.provide('app.mapDirective');

goog.require('app');
goog.require('ngeo.mapDirective');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.geom.Point');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');


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
      'center': '=appMapCenter'
    },
    controller: 'AppMapController',
    controllerAs: 'mapCtrl',
    bindToController: true,
    template: '<div class="map" ngeo-map=mapCtrl.map></div>'
  };
};


app.module.directive('appMap', app.mapDirective);



/**
 * @constructor
 * @export
 * @ngInject
 */
app.MapController = function() {

  var center = this['center'];

  /**
   * @type {ol.Map}
   * export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: center || app.MapController.DEFAULT_CENTER,
      zoom: app.MapController.DEFAULT_ZOOM
    })
  });

  if (center) {
    var feature = new ol.Feature(new ol.geom.Point(center));
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [feature]
      })
    });

    // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
    // makes the vector layer "unmanaged", meaning that it is always on top.
    vectorLayer.setMap(this.map);

    this.map.getView().setZoom(app.MapController.DEFAULT_POINT_ZOOM);
  }
};


/**
 * @const
 * @type {Array.<number>}
 */
app.MapController.DEFAULT_CENTER = [0, 0];


/**
 * @const
 * @type {number}
 */
app.MapController.DEFAULT_ZOOM = 4;


/**
 * @const
 * @type {number}
 */
app.MapController.DEFAULT_POINT_ZOOM = 12;


app.module.controller('AppMapController', app.MapController);
