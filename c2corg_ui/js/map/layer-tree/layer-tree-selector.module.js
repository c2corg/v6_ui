import angular from 'angular';
import LayerTreeSelectorController from './layer-tree-selector.controller';
import LayerTreeSelectorDirective from './layer-tree-selector.directive';
import ngeoBackgroundLayerMgr from 'ngeo/map/BackgroundLayerMgr';

export default angular
  .module('c2c.map.layer-tree-selector', [ngeoBackgroundLayerMgr.name])
  .controller('LayerTreeSelectorController', LayerTreeSelectorController)
  .directive('c2cLayerTreeSelector', LayerTreeSelectorDirective)
  .name;
