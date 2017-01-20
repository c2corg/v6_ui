goog.provide('app.GpxUploadController');
goog.provide('app.gpxUploadDirective');

goog.require('app');
/** @suppress {extraRequire} */
goog.require('ngeo.filereaderDirective');
goog.require('ol.format.GPX');
goog.require('ol.Feature');
goog.require('ol.geom.MultiLineString');

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
 *
 * @param {Array.<ol.Feature>} features - invalid features that have to be checked
 * @returns {Array.<ol.Feature>} features - this geometry is valid
 * @private
 */
app.GpxUploadController.prototype.validateFeatures_ = function(features) {
  for (var i = 0; i < features.length; i++) {
    var geom = /** @type{ol.geom.Geometry} */ (features[i].getGeometry());

    if (geom instanceof ol.geom.MultiLineString) {
      var multiLineString = /** @type{ol.geom.MultiLineString} */ (geom);
      var lineStrings = multiLineString.getLineStrings();

      for (var j = 0; j < lineStrings.length; j++) {
        if (lineStrings[j].getCoordinates().length === 1) {
          lineStrings.splice(j, 1);
        }
      }

      var newMs = new ol.geom.MultiLineString([]);
      newMs.setLineStrings(lineStrings);
      features[i].setGeometry(newMs);
    }
  }
  return features;
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
  features = this.validateFeatures_(features);
  if (features.length > 0) {
    this.scope_.$root.$emit('featuresUpload', features);
  }
};


app.module.controller('AppGpxUploadController', app.GpxUploadController);
