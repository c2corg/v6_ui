goog.provide('app.GpxUploadController');

goog.require('app');
goog.require('ol.format.GPX');


/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
app.GpxUploadController = function($scope) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {boolean|undefined}
   * @export
   */
  this.fileReaderSupported = undefined;

  /**
   * @type {string}
   * @export
   */
  this.fileContent = '';

  $scope.$watch(() => {
    return this.fileContent;
  }, this.importGpx_.bind(this));
};


/**
 * @param {string} gpx GPX document.
 * @private
 */
app.GpxUploadController.prototype.importGpx_ = function(gpx) {
  const gpxFormat = new ol.format.GPX();
  const features = gpxFormat.readFeatures(gpx, {
    featureProjection: 'EPSG:3857'
  });
  if (features.length) {
    this.scope_.$root.$emit('featuresUpload', features);
  }
};


app.module.controller('AppGpxUploadController', app.GpxUploadController);
