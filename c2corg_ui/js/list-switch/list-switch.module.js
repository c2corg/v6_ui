import angular from 'angular';
import ListSwitchController from './list-switch.controller';
import ListSwitchDirective from './list-switch.directive';

export default angular
  .module('c2c.list-switch', [])
  .controller('ListSwitchController', ListSwitchController)
  .directive('c2cListSwitch', ListSwitchDirective)
  .name;
