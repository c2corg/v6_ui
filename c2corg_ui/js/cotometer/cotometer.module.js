import angular from 'angular';
import CotometerController from './cotometer.controller';
import CotometerDirective from './cotometer.directive';

export default angular
  .module('c2c.cotometer', [])
  .controller('CotometerController', CotometerController)
  .directive('c2cCotometer', CotometerDirective)
  .name;
