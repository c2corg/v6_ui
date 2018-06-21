import angular from 'angular';
import PaginationController from './pagination.controller';
import PaginationDirective from './pagination.directive';

export default angular
  .module('c2c.pagination', [])
  .controller('PaginationController', PaginationController)
  .directive('c2cPagination', PaginationDirective)
  .name;
