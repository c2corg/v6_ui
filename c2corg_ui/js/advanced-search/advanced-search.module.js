import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import AdvancedSearchController from './advanced-search.cotnroller';
import AdvancedSearchDirective from './advanced-search.directive';

export default angular
  .module('c2c.advanced-search', [
    c2cUtils
  ])
  .controller('AdvancedSearchController', AdvancedSearchController)
  .directive('c2cAdvancedSearch', AdvancedSearchDirective)
  .name;
