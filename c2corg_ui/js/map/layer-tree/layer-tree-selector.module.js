import angular from 'angular';
import LayerTreeSelectorController from './layer-tree-selector.controller';
import LayerTreeSelectorDirective from './layer-tree-selector.directive';

export default angular
  .module('c2c.map.layer-tree-selector', [])
  .controller('LayerTreeSelectorController', LayerTreeSelectorController)
  .directive('c2cLayerTreeSelector', LayerTreeSelectorDirective)
  .name;
