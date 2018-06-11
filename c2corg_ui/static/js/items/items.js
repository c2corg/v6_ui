import ItemsController from './items.controller.js';
import ItemsDirective from './items.directive.js';
import ItemsService from './items.service.js';

export default angular
  .module('c2c.items', [])
  .service('ItemsService', ItemsService)
  .controller('ItemsController', ItemsController)
  .directive('c2cItems', ItemsDirective)
  .name;
