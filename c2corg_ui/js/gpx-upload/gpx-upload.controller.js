import olFormatGPX from 'ol/format/GPX.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
export default class GpxUploadController {
  constructor($scope) {
    'ngInject';

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
  }


  /**
   * @param {string} gpx GPX document.
   * @private
   */
  importGpx_(gpx) {
    const gpxFormat = new olFormatGPX();
    const features = gpxFormat.readFeatures(gpx, {
      featureProjection: 'EPSG:3857'
    });
    if (features.length) {
      this.scope_.$root.$emit('featuresUpload', features);
    }
  }
}
