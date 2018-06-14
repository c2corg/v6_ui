import angular from 'angular';
import CotometerController from './items.controller';
import CotometerDirective from './items.directive';

export default angular
  .module('c2c.cotometer', [])
  .controller('CotometerController', CotometerController)
  .directive('c2cCotometer', CotometerDirective)
  .name;
