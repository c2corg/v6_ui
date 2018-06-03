goog.provide('app.diffMapDirective');

goog.require('app');


/**
 * A directive to show a map with two geometries of two different document
 * versions on the diff page.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.diffMapDirective = function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'AppDiffMapController',
    controllerAs: 'diffMapCtrl',
    bindToController: true,
    templateUrl: '/static/partials/map/diffmap.html'
  };
};

app.module.directive('appDiffMap', app.diffMapDirective);
