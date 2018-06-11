/**
 * @module app.GeomDownloadController
 */
import appBase from './index.js';
import olFormatGeoJSON from 'ol/format/GeoJSON.js';
import olFormatGPX from 'ol/format/GPX.js';
import olFormatKML from 'ol/format/KML.js';


appBase.module.directive('appGeomDownload', appBase.geomDownloadDirective);


/**
 * @param {ngeo.Download} ngeoDownload ngeo download service.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features shown on the map.
 * @constructor
 * @struct
 * @ngInject
 */
const exports = function(ngeoDownload, mapFeatureCollection) {

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
exports.prototype.downloadFeatures_ = function(
  format, extension, mimetype) {
  const geojson = new olFormatGeoJSON();
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
exports.prototype.downloadGpx = function(event) {
  event.stopPropagation();
  this.downloadFeatures_(
    new olFormatGPX(), '.gpx', 'application/gpx+xml');
};


/**
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
exports.prototype.downloadKml = function(event) {
  event.stopPropagation();
  this.downloadFeatures_(
    new olFormatKML(), '.kml', 'application/vnd.google-earth.kml+xml');
};


appBase.module.controller(
  'AppGeomDownloadController', exports);


export default exports;
