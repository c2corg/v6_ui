import angular from 'angular';
import CapitalizeFilter from './capitalize.filter';

export default angular
  .module('c2c.filters.capitalize', [])
  .filter('capitalize', CapitalizeFilter)
  .name;
