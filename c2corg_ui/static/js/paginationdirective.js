goog.provide('app.paginationDirective');

goog.require('app');


/**
 * This directive is used to display pagination buttons
 * in the search result list.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.paginationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppPaginationController',
    controllerAs: 'pageCtrl',
    bindToController: true,
    templateUrl: '/static/partials/pagination.html'
  };
};

app.module.directive('appPagination', app.paginationDirective);
