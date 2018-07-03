import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import c2cConstants from '../constants/constants.module';
import SearchFiltersController from './search-filters.controller';
import SearchFiltersDirective from './search-filters.directive';
import OutingFiltersController from './outing-filters.controller';
import XreportFiltersController from './xreport-filters.controller';
import StickFiltersController from './sticky-filters.controller';
import StickyFiltersDirective from './sticky-filters.directive';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.search-filters', [
    ngeoLocation.name,
    c2cUtils,
    c2cConstants
  ])
  .controller('SearchFiltersController', SearchFiltersController)
  .controller('OutingFiltersController', OutingFiltersController)
  .controller('XreportFiltersController', XreportFiltersController)
  .directive('c2cSearchFilters', SearchFiltersDirective)
  .controller('StickyFiltersController', StickFiltersController)
  .directive('c2cStickyFilters', StickyFiltersDirective)
  .name;
