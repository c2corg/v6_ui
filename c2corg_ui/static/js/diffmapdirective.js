/**
 * @module app.diffMapDirective
 */
import appBase from './index.js';

/**
 * A directive to show a map with two geometries of two different document
 * versions on the diff page.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'AppDiffMapController',
    controllerAs: 'diffMapCtrl',
    bindToController: true,
    templateUrl: '/static/partials/map/diffmap.html'
  };
};

appBase.module.directive('appDiffMap', exports);


export default exports;
