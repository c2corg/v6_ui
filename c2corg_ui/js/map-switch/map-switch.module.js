import angular from 'angular';
import MapSwitchController from './map-switch.controller';
import MapSwitchDirective from './map-switch.directive';

export default angular
  .module('c2c.map-switch', [])
  .controller('MapSwitchController', MapSwitchController)
  .directive('c2cMapSwitch', MapSwitchDirective)
  .name;
