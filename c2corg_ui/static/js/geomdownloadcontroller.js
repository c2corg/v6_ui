goog.provide('app.GeomDownloadController');

goog.require('app');
goog.require('ol.format.GeoJSON');
goog.require('ol.format.GPX');
goog.require('ol.format.KML');


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
  const geojson = new ol.format.GeoJSON();
  const features = geojson.readFeatures(this.featureCollection_);
  if (features.length) {
    // Export only the current document geometry, not the associated features
    const feature = features[0];
    const properties = feature.getProperties();
    if ('title' in properties && properties['title']) {
      feature.set('name', properties['title']);
    }
    const filename = feature.get('documentId') + extension;
    const content = format.writeFeatures([feature], {
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
