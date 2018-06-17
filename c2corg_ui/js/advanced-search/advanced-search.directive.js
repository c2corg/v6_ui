import template from 'advanced-search.html';

/**
 * This directive is used to display the advanced search form and results.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const AdvancedSearchDirective = () => {
  return {
    restrict: 'E',
    controller: 'AdvancedSearchController',
    controllerAs: 'searchCtrl',
    bindToController: {
      'doctype': '@documentType',
      'useMap': '='
    },
    scope: true,
    template
  };
};

export default AdvancedSearchDirective;
