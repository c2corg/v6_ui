import angular from 'angular';
import LoadingDirective from './loading.directive';

export default angular
  .module('c2c.loading', [])
  .directive('c2cLoading', LoadingDirective)
  .name;
