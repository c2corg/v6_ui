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
 * @constructor
 * @export
 * @ngInject
 */
app.MapController = function($scope) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  var center = this['center'];

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

  if (center) {
    this.showCenterPoint_(center);
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
 * @param {Array.<number>|ol.geom.Point} point Point to center on.
 * @private
 */
app.MapController.prototype.showCenterPoint_ = function(point) {
  // TODO: generalize to show any vector features
  if (point instanceof Array) {
    point = new ol.geom.Point(point);
  }
  var feature = new ol.Feature(point);
  var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature]
    })
  });

  // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
  // makes the vector layer "unmanaged", meaning that it is always on top.
  vectorLayer.setMap(this.map);

  this.view_.setCenter(point.getCoordinates());
  this.view_.setZoom(app.MapController.DEFAULT_POINT_ZOOM);
};


/**
 * @param {Object} event
 * @param {Object} data
 * @private
 */
app.MapController.prototype.handleEditModelChange_ = function(event, data) {
  if ('geometry' in data && data['geometry']) {
    // TODO: handle lines and polygons
    var geometry = data['geometry'];
    if ('geom' in geometry && geometry['geom'] instanceof ol.geom.Point) {
      this.showCenterPoint_(geometry['geom']);
    }
  }
};


app.module.controller('AppMapController', app.MapController);
