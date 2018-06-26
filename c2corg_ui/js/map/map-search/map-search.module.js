import angular from 'angular';
import MapSearchController from './map-search.controller';
import MapSearchDirective from './map-search.directive';
import c2cConstants from '../../constants/constants.module';
import ngeoSearchModule from 'ngeo/src/search/module';

export default angular
  .module('c2c.map.map-search', [
    c2cConstants,
    ngeoSearchModule.name
  ])
  .controller('MapSearchController', MapSearchController)
  .directive('c2cMapSearch', MapSearchDirective)
  .name;
