import angular from 'angular';
import GeolocationController from './geolocation.controller';
import GeolocationDirective from './geolocation.directive';

export default angular
  .module('c2c.map.geolocation', [])
  .controller('GeolocationController', GeolocationController)
  .directive('c2cGeolocation', GeolocationDirective)
  .name;
