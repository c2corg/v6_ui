goog.provide('app.layertreeSelectorDirective');

goog.require('app');

app.layertreeSelectorDirective = function() {
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

app.module.directive('appLayertreeSelector', app.layertreeSelectorDirective);
