import template from './layer-tree-selector.html';

const LayertreeSelectorDirective = function() {
  return {
    restrict: 'E',
    controller: 'LayertreeSelectorController',
    controllerAs: 'mapLayerCtrl',
    bindToController: true,
    scope: {
      'map': '=c2cLayertreeSelectorMap'
    },
    template
  };
};

export default LayertreeSelectorDirective;
