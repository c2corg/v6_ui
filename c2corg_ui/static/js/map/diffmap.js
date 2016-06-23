goog.provide('app.DiffMapController');
goog.provide('app.diffMapDirective');

goog.require('app');
goog.require('app.MapController');
goog.require('app.utils');
/** @suppress {extraRequire} */
goog.require('ngeo.mapDirective');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
goog.require('ol.interaction.MouseWheelZoom');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * A directive to show a map with two geometries of two different document
 * versions on the diff page.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.diffMapDirective = function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'AppDiffMapController',
    controllerAs: 'diffMapCtrl',
    bindToController: true,
    templateUrl: '/static/partials/map/diffmap.html'
  };
};


app.module.directive('appDiffMap', app.diffMapDirective);


/**
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection
 *    of features to show on the map.
 * @constructor
 * @export
 * @ngInject
 */
app.DiffMapController = function(mapFeatureCollection) {

  /**
   * @type {Array<ol.Feature>}
   * @private
   */
  this.features_ = [];

  if (mapFeatureCollection) {
    var format = new ol.format.GeoJSON();
    this.features_ = format.readFeatures(mapFeatureCollection);
  }

  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
    view: new ol.View({
      center: ol.extent.getCenter(app.MapController.DEFAULT_EXTENT),
      zoom: app.MapController.DEFAULT_ZOOM
    })
  });

  var mouseWheelZoomInteraction = new ol.interaction.MouseWheelZoom();
  this.map.addInteraction(mouseWheelZoomInteraction);
  app.utils.setupSmartScroll(mouseWheelZoomInteraction);

  if (!goog.array.isEmpty(this.features_)) {
    // Recentering on the features extent requires that the map actually
    // has a target. Else the map size cannot be computed.
    this.map.on('change:target', goog.bind(function() {
      this.showFeatures_(this.features_);
    }, this));
  }
};


/**
 * @return {ol.layer.Vector} Vector layer.
 * @private
 */
app.DiffMapController.prototype.getVectorLayer_ = function() {
  if (!this.vectorLayer_) {
    // style for the first version
    var fill1 = new ol.style.Fill({
      color: 'rgba(237, 41, 39, 0.6)'
    });
    var stroke1 = new ol.style.Stroke({
      color: 'rgba(237, 41, 39, 1)',
      width: 3
    });
    var style1 = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill1,
        stroke: stroke1,
        radius: 10
      }),
      fill: fill1,
      stroke: stroke1
    });

    // style for the second version
    var fill2 = new ol.style.Fill({
      color: 'rgba(31, 157, 61, 0.9)'
    });
    var stroke2 = new ol.style.Stroke({
      color: 'rgba(31, 157, 61, 1)',
      width: 2
    });
    var style2 = new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill2,
        stroke: stroke2,
        radius: 5
      }),
      fill: fill2,
      stroke: stroke2
    });

    this.vectorLayer_ = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: function(feature, style) {
        if (feature.get('type') === 'v1') {
          return style1;
        } else {
          return style2;
        }
      }
    });

    this.vectorLayer_.setMap(this.map);
  }
  return this.vectorLayer_;
};


/**
 * @param {Array<ol.Feature>} features Features to show.
 * @private
 */
app.DiffMapController.prototype.showFeatures_ = function(features) {
  goog.asserts.assert(features.length > 0);
  var vectorLayer = this.getVectorLayer_();
  vectorLayer.getSource().addFeatures(features);

  var mapSize = this.map.getSize();
  if (mapSize) {
    this.map.getView().fit(vectorLayer.getSource().getExtent(), mapSize, {
      padding: [10, 10, 10, 10],
      maxZoom: app.MapController.DEFAULT_POINT_ZOOM
    });
  }
};

app.module.controller('AppDiffMapController', app.DiffMapController);
