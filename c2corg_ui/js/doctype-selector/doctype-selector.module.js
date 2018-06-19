import angular from 'angular';
import DoctypeSelectorController from './doctype-selector.controller';
import DoctypeSelectorDirective from './doctype-selector.directive';

export default angular
  .module('c2c.doctype-selector', [])
  .controller('DoctypeSelectorController', DoctypeSelectorController)
  .directive('c2cDoctypeSelector', DoctypeSelectorDirective)
  .name;
