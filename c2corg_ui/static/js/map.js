goog.provide('app.MapController');
goog.provide('app.mapDirective');

goog.require('app');
goog.require('ngeo.mapDirective');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
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
      'center': '=appMapCenter',
      'editCtrl': '=appMapEditCtrl'
    },
    controller: 'AppMapController',
    controllerAs: 'mapCtrl',
    bindToController: true,
    template: '<div class="map" ngeo-map=mapCtrl.map></div>'
  };
};


app.module.directive('appMap', app.mapDirective);



/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {angular.$window} $window Window object.
 * @constructor
 * @export
 * @ngInject
 */
app.MapController = function($scope, $window) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {?ol.layer.Vector}
   * @private
   */
  this.vectorLayer_ = null;

  /**
   * @type {?app.DocumentEditingController}
   * @private
   */
  this.editCtrl_ = this['editCtrl'];
  if (this.editCtrl_) {
    this.scope_.$root.$on('documentDataChange',
        goog.bind(this.handleEditModelChange_, this));
  }

  /**
   * @type {Array<ol.Feature>}
   * @private
   */
  this.features_ = [];

  var center = this['center'];
  var featureCollection = $window['mapFeatureCollection'];
  if (center) {
    var point = new ol.geom.Point(center);
    this.features_.push(new ol.Feature(point));
  } else if (featureCollection) {
    var format = new ol.format.GeoJSON();
    goog.array.extend(this.features_, format.readFeatures(featureCollection));
  }

  /**
   * @type {ol.Map}
   * @export
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

  /**
   * @type {ol.View}
   * @private
   */
  this.view_ = this.map.getView();

  if (!goog.array.isEmpty(this.features_)) {
    // Recentering on the features extent requires that the map actually
    // has a target. Else the map size cannot be computed.
    this.map.on('change:target', goog.bind(function() {
      this.showFeatures_(this.features_);
    }, this));
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


/**
 * @return {ol.layer.Vector} Vector layer.
 * @private
 */
app.MapController.prototype.getVectorLayer_ = function() {
  if (!this.vectorLayer_) {
    this.vectorLayer_ = new ol.layer.Vector({
      source: new ol.source.Vector()
    });

    // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
    // makes the vector layer "unmanaged", meaning that it is always on top.
    this.vectorLayer_.setMap(this.map);
  }
  return this.vectorLayer_;
};


/**
 * @param {Array<ol.Feature>} features Features to show.
 * @private
 */
app.MapController.prototype.showFeatures_ = function(features) {
  goog.asserts.assert(features.length > 0);
  var vectorLayer = this.getVectorLayer_();
  vectorLayer.getSource().addFeatures(features);

  if (features.length == 1 &&
      features[0].getGeometry() instanceof ol.geom.Point) {
    var point = /** @type {ol.geom.Point} */ (features[0].getGeometry());
    this.view_.setCenter(point.getCoordinates());
    this.view_.setZoom(app.MapController.DEFAULT_POINT_ZOOM);
  } else {
    var mapSize = this.map.getSize() || null;
    this.view_.fit(vectorLayer.getSource().getExtent(), mapSize, {
      padding: [10, 10, 10, 10]
    });
  }
};


/**
 * @param {Object} event
 * @param {Object} data
 * @private
 */
app.MapController.prototype.handleEditModelChange_ = function(event, data) {
  if ('geometry' in data && data['geometry']) {
    var geometry = data['geometry'];
    if ('geom' in geometry && geometry['geom'] instanceof ol.geom.Geometry) {
      var features = [new ol.Feature(geometry['geom'])];
      this.showFeatures_(features);
    }
  }
};


app.module.controller('AppMapController', app.MapController);
