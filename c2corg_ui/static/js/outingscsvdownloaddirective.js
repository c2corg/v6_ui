goog.provide('app.outingsCsvDownloadDirective');

goog.require('app');

/**
 * This directive is used to display a download button for outings in CSV format.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.outingsCsvDownloadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppOutingsCsvDownloadController',
    controllerAs: 'csvCtrl',
    templateUrl: '/static/partials/outingscsvdownload.html'
  };
};

app.module.directive('appOutingsCsvDownload', app.outingsCsvDownloadDirective);
