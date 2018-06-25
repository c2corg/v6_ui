import template from './layer-tree-selector.html';

const LayertreeSelectorDirective = function() {
  return {
    restrict: 'E',
    controller: 'LayertreeSelectorController',
    controllerAs: 'mapLayerCtrl',
    bindToController: true,
    scope: {
      'map': '=appLayertreeSelectorMap'
    },
    template
  };
};

export default LayertreeSelectorDirective;
