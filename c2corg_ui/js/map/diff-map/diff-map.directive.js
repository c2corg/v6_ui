import template from './diff-map.html';

/**
 * A directive to show a map with two geometries of two different document
 * versions on the diff page.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const DiffMapDirective = () => {
  return {
    restrict: 'E',
    scope: {},
    controller: 'DiffMapController',
    controllerAs: 'diffMapCtrl',
    bindToController: true,
    template
  };
};

export default DiffMapDirective;
