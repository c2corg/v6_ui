import angular from 'angular';
import GeolocationController from './geolocation.controller';
import GeolocationDirective from './geolocation.directive';
import ngeoMobilGeolocation from 'ngeo/src/geolocation/mobile';

export default angular
  .module('c2c.map.geolocation', [ngeoMobilGeolocation.name])
  .controller('GeolocationController', GeolocationController)
  .directive('c2cGeolocation', GeolocationDirective)
  .name;
