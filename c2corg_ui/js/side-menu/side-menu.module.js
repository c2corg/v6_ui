import angular from 'angular';
import SideMenuDirective from './side-menu.directive';

export default angular
  .module('c2c.side-menu', [])
  .directive('c2cSideMenu', SideMenuDirective)
  .name;
