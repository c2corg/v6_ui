import angular from 'angular';
import DoctypeSelectorController from './doctype-selector.controller';
import DoctypeSelectorDirective from './doctype-selector.directive';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.doctype-selector', [ngeoStatemanagerModule.name])
  .controller('DoctypeSelectorController', DoctypeSelectorController)
  .directive('c2cDoctypeSelector', DoctypeSelectorDirective)
  .name;
