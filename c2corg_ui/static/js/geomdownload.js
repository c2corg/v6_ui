goog.provide('app.GeomDownloadController');
goog.provide('app.geomDownloadDirective');

goog.require('app');
goog.require('ngeo.Download');
goog.require('ol.format.GeoJSON');
goog.require('ol.format.GPX');
goog.require('ol.format.KML');


/**
 * This directive is used to display a track download button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.geomDownloadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppGeomDownloadController',
    controllerAs: 'dlCtrl',
    templateUrl: '/static/partials/geomdownload.html'
  };
};

app.module.directive('appGeomDownload', app.geomDownloadDirective);


/**
 * @param {ngeo.Download} ngeoDownload ngeo download service.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features shown on the map.
 * @constructor
 * @struct
 * @ngInject
 */
app.GeomDownloadController = function(ngeoDownload, mapFeatureCollection) {

  /**
   * @type {ngeo.Download}
   * @private
   */
  this.download_ = ngeoDownload;

  /**
   * @type {?GeoJSONFeatureCollection}
   * @private
   */
  this.featureCollection_ = mapFeatureCollection;
};


/**
 * @param {ol.format.XMLFeature} format
 * @param {string} extension
 * @param {string} mimetype
 * @private
 */
app.GeomDownloadController.prototype.downloadFeatures_ = function(
  format, extension, mimetype) {
  var geojson = new ol.format.GeoJSON();
  var features = geojson.readFeatures(this.featureCollection_);
  if (features.length) {
    // Export only the current document geometry, not the associated features
    var feature = features[0];
    var properties = feature.getProperties();
    if ('title' in properties && properties['title']) {
      feature.set('name', properties['title']);
    }
    var filename = feature.get('documentId') + extension;
    var content = format.writeFeatures([feature], {
      featureProjection: 'EPSG:3857'
    });
    this.download_(content, filename, mimetype + ';charset=utf-8');
  }
};


/**
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.GeomDownloadController.prototype.downloadGpx = function(event) {
  event.stopPropagation();
  this.downloadFeatures_(
    new ol.format.GPX(), '.gpx', 'application/gpx+xml');
};


/**
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.GeomDownloadController.prototype.downloadKml = function(event) {
  event.stopPropagation();
  this.downloadFeatures_(
    new ol.format.KML(), '.kml', 'application/vnd.google-earth.kml+xml');
};


app.module.controller(
  'AppGeomDownloadController', app.GeomDownloadController);
