/**
 * @module app.paginationDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display pagination buttons
 * in the search result list.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppPaginationController',
    controllerAs: 'pageCtrl',
    bindToController: true,
    templateUrl: '/static/partials/pagination.html'
  };
};

appBase.module.directive('appPagination', exports);


export default exports;
