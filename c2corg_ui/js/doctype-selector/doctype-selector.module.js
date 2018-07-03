import angular from 'angular';
import DoctypeSelectorController from './doctype-selector.controller';
import DoctypeSelectorDirective from './doctype-selector.directive';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.doctype-selector', [ngeoLocation])
  .controller('DoctypeSelectorController', DoctypeSelectorController)
  .directive('c2cDoctypeSelector', DoctypeSelectorDirective)
  .name;
