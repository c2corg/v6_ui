import template from './pagination.html';

/**
 * This directive is used to display pagination buttons
 * in the search result list.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const PaginationDirective = () => {
  return {
    restrict: 'E',
    controller: 'PaginationController',
    controllerAs: 'pageCtrl',
    bindToController: true,
    template
  };
};

export default PaginationDirective;
