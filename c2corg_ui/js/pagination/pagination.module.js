import angular from 'angular';
import PaginationController from './pagination.controller';
import PaginationDirective from './pagination.directive';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.pagination', [ngeoStatemanagerModule.name])
  .controller('PaginationController', PaginationController)
  .directive('c2cPagination', PaginationDirective)
  .name;
