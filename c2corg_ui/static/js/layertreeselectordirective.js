/**
 * @module app.layertreeSelectorDirective
 */
import appBase from './index.js';

const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppLayertreeSelectorController',
    controllerAs: 'mapLayerCtrl',
    bindToController: true,
    scope: {
      'map': '=appLayertreeSelectorMap'
    },
    templateUrl: '/static/partials/map/layertreeselector.html'
  };
};

appBase.module.directive('appLayertreeSelector', exports);


export default exports;
