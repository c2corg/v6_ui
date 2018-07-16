import angular from 'angular';
import LayertreeSelectorController from './layertree-selector.controller';
import LayertreeSelectorDirective from './layertree-selector.directive';
import ngeoMapModule from 'ngeo/map/module';

export default angular
  .module('c2c.map.layertree-selector', [ngeoMapModule.name])
  .controller('LayertreeSelectorController', LayertreeSelectorController)
  .directive('c2cLayertreeSelector', LayertreeSelectorDirective)
  .name;
