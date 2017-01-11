goog.provide('app.TrackDownloadController');
goog.provide('app.trackDownloadDirective');

goog.require('app');
goog.require('app.utils');
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
app.trackDownloadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppTrackDownloadController',
    controllerAs: 'trackCtrl',
    templateUrl: '/static/partials/trackdownload.html'
  };
};


app.module.directive('appTrackDownload', app.trackDownloadDirective);


/**
 * @param {ngeo.Download} ngeoDownload ngeo download service.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features shown on the map.
 * @constructor
 * @export
 * @ngInject
 */
app.TrackDownloadController = function(ngeoDownload, mapFeatureCollection) {

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
app.TrackDownloadController.prototype.downloadFeatures_ = function(
  format, extension, mimetype) {
  var geojson = new ol.format.GeoJSON();
  var features = geojson.readFeatures(this.featureCollection_);
  features = features.filter(app.utils.isLineFeature);
  if (features.length) {
    var filename = features[0].get('documentId') + extension;
    var content = format.writeFeatures(features, {
      featureProjection: 'EPSG:3857'
    });
    this.download_(content, filename, mimetype + ';charset=utf-8');
  }
};


/**
 * @export
 */
app.TrackDownloadController.prototype.downloadGpx = function() {
  this.downloadFeatures_(
    new ol.format.GPX(), '.gpx', 'application/gpx+xml');
};


/**
 * @export
 */
app.TrackDownloadController.prototype.downloadKml = function() {
  this.downloadFeatures_(
    new ol.format.KML(), '.kml', 'application/vnd.google-earth.kml+xml');
};


app.module.controller(
  'AppTrackDownloadController', app.TrackDownloadController);
