/**
 * @module app.outingsCsvDownloadDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display a download button for outings in CSV format.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppOutingsCsvDownloadController',
    controllerAs: 'csvCtrl',
    templateUrl: '/static/partials/outingscsvdownload.html'
  };
};

appBase.module.directive('appOutingsCsvDownload', exports);


export default exports;
