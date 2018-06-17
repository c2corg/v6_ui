import angular from 'angular';
import ActivityFilterController from './activity-filter.controller';
import ActivityFilterDirective from './activity-filter.directive';

export default angular
  .module('c2c.filter.activity', [])
  .controller('ActivityFilterController', ActivityFilterController)
  .directive('c2cActivityFilter', ActivityFilterDirective)
  .name;
