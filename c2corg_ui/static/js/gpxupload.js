goog.provide('app.GpxUploadController');
goog.provide('app.gpxUploadDirective');

goog.require('app');
/** @suppress {extraRequire} */
goog.require('ngeo.filereaderDirective');
goog.require('ol.format.GPX');

/**
 * This directive is used to display a GPX file upload button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.gpxUploadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppGpxUploadController',
    controllerAs: 'gpxCtrl',
    bindToController: true,
    templateUrl: '/static/partials/gpxupload.html'
  };
};


app.module.directive('appGpxUpload', app.gpxUploadDirective);


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

  $scope.$watch(function() {
    return this.fileContent;
  }.bind(this), this.importGpx_.bind(this));
};


/**
 * @param {string} gpx GPX document.
 * @private
 */
app.GpxUploadController.prototype.importGpx_ = function(gpx) {
  var gpxFormat = new ol.format.GPX();
  var features = gpxFormat.readFeatures(gpx, {
    featureProjection: 'EPSG:3857'
  });
  if (features.length > 1) {
    var parser = new jsts.io.OL3Parser();
    var gf = new jsts.geom.GeometryFactory();

    var jstsFeatures = [];
    for (var i = 0; i < features.length; i++) {
      var geofeat = features[i].getGeometry();
      var jstsfeat = parser.read(geofeat);
      jstsFeatures.push(jstsfeat);
    }
    var jstsFeatureColl = gf.createGeometryCollection(jstsFeatures);
    var mergedFeatures = jstsFeatureColl.union();
    features[0].setGeometry(parser.write(mergedFeatures));
  }
  if (features.length) {
    this.scope_.$root.$emit('featuresUpload', features);
  }
};


app.module.controller('AppGpxUploadController', app.GpxUploadController);
