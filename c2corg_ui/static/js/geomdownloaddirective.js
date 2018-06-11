/**
 * @module app.geomDownloadDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display a track download button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppGeomDownloadController',
    controllerAs: 'dlCtrl',
    templateUrl: '/static/partials/geomdownload.html'
  };
};

appBase.module.directive('appGeomDownload', exports);


export default exports;
