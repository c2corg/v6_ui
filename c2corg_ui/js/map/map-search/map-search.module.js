import angular from 'angular';
import MapSearchController from './map-search.controller';
import MapSearchDirective from './map-search.directive';
import c2cConstants from '../../constants/constants.module';

export default angular
  .module('c2c.map.map-search', [
    c2cConstants
  ])
  .controller('MapSearchController', MapSearchController)
  .directive('c2cMapSearch', MapSearchDirective)
  .name;
