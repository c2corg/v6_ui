import angular from 'angular';
import MapController from './map.controller';
import MapDirective from './map.directive';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c.map', [
    c2cUtils
  ])
  .controller('MapController', MapController)
  .directive('c2cMap', MapDirective)
  .name;
