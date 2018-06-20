import template from './geom-download.html';

/**
 * This directive is used to display a track download button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const GeomDownloadDirective = () => {
  return {
    restrict: 'E',
    controller: 'GeomDownloadController',
    controllerAs: 'dlCtrl',
    template
  };
};

export default GeomDownloadDirective;
