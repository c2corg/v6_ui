/**
 * @module app.gpxUploadDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display a GPX file upload button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppGpxUploadController',
    controllerAs: 'gpxCtrl',
    bindToController: true,
    templateUrl: '/static/partials/gpxupload.html'
  };
};

appBase.module.directive('appGpxUpload', exports);


export default exports;
