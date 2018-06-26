import angular from 'angular';
import MapController from './map.controller';
import MapDirective from './map.directive';
import c2cUtils from '../utils/utils.module';
import c2cDiffMap from './diff-map/diff-map.module';
import c2cGeolocation from './geolocation/geolocation.module';
import c2cLayerTree from './layer-tree/layer-tree-selector.module';
import c2cBiodivsports from './biodivsports/biodivsports.module';
import SimplifyService from './simplify.service';
import ngeoLocation from 'ngeo/src/statemanager/Location';
import ngeoMap from 'ngeo/src/map/module';

export default angular
  .module('c2c.map', [
    ngeoLocation.name,
    ngeoMap.name,
    c2cUtils,
    c2cDiffMap,
    c2cGeolocation,
    c2cLayerTree,
    c2cBiodivsports
  ])
  .controller('MapController', MapController)
  .directive('c2cMap', MapDirective)
  .service('SimplifyService', SimplifyService)
  .name;
