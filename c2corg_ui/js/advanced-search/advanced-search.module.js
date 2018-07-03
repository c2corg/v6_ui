import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import AdvancedSearchController from './advanced-search.controller';
import AdvancedSearchDirective from './advanced-search.directive';
import SliderController from './slider.controller';
import SliderDirective from './slider.directive';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.advanced-search', [
    c2cUtils,
    ngeoStatemanagerModule.name
  ])
  .controller('AdvancedSearchController', AdvancedSearchController)
  .directive('c2cAdvancedSearch', AdvancedSearchDirective)
  .controller('SliderController', SliderController)
  .directive('c2cSlider', SliderDirective)
  .name;
