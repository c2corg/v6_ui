goog.provide('app.geomDownloadDirective');

goog.require('app');


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
