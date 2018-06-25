import template from './geolocation.html';

/**
 * This directive is used to display a "center on my position" button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const GeolocationDirective = () => {
  return {
    restrict: 'E',
    controller: 'GeolocationController',
    controllerAs: 'geoCtrl',
    bindToController: true,
    scope: {
      'map': '=c2cGeolocationMap'
    },
    template
  };
};

export default GeolocationDirective;
