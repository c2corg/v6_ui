import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import c2cConstants from '../constants/constants.module';
import SearchFiltersController from './search-filters.controller';
import SearchFiltersDirective from './search-filters.directive';
import OutingFiltersController from './outing-filters.controller';
import XreportFiltersController from './xreport-filters.controller';

export default angular
  .module('c2c.search-filters', [
    c2cUtils,
    c2cConstants
  ])
  .controller('SearchFiltersController', SearchFiltersController)
  .controller('OutingFiltersController', OutingFiltersController)
  .controller('XreportFiltersController', XreportFiltersController)
  .directive('c2cSearchFilters', SearchFiltersDirective)
  .name;
