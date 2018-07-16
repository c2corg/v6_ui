import template from './layertree-selector.html';

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
