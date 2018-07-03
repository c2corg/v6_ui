import angular from 'angular';
import DiffMapController from './diff-map.controller';
import DiffMapDirective from './diff-map.directive';
import ngeoMap from 'ngeo/map/component';

export default angular
  .module('c2c.map.diff-map', [ngeoMap.name])
  .controller('DiffMapController', DiffMapController)
  .directive('c2cDiffMap', DiffMapDirective)
  .name;
