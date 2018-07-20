import olFormatGPX from 'ol/format/GPX';

/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
export default class GpxUploadController {
  constructor($scope, documentEditing) {
    'ngInject';

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    this.documentEditing = documentEditing;

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
      featureProjection: this.documentEditing.DATA_PROJ
    });
    if (features.length) {
      this.scope_.$root.$emit('featuresUpload', features);
    }
  }
}
