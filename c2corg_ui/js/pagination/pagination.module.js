import angular from 'angular';
import PaginationController from './pagination.controller';
import PaginationDirective from './pagination.directive';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.pagination', [ngeoLocation.name])
  .controller('PaginationController', PaginationController)
  .directive('c2cPagination', PaginationDirective)
  .name;
