goog.provide('app.gpxUploadDirective');

goog.require('app');

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
