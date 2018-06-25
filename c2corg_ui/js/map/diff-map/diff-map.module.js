import angular from 'angular';
import DiffMapController from './diff-map.controller';
import DiffMapDirective from './diff-map.directive';

export default angular
  .module('c2c.map.diff-map', [])
  .controller('DiffMapController', DiffMapController)
  .directive('c2cDiffMap', DiffMapDirective)
  .name;
