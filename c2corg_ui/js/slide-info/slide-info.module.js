import angular from 'angular';
import SlideInfoController from './slide-info.controller';
import SlideInfoDirective from './slide-info.directive';
import c2cApi from '../api/api.module';

export default angular
  .module('c2c.slide-info', [
    c2cApi
  ])
  .controller('SlideInfoController', SlideInfoController)
  .directive('c2cslideInfo', SlideInfoDirective)
  .name;
