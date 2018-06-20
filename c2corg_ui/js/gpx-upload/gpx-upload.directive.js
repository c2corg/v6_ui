import template from './gpx-upload.html';

/**
 * This directive is used to display a GPX file upload button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const GpxUploadDirective = () => {
  return {
    restrict: 'E',
    controller: 'GpxUploadController',
    controllerAs: 'gpxCtrl',
    bindToController: true,
    template
  };
};

export default GpxUploadDirective;
