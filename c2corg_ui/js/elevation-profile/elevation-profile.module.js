import angular from 'angular';
import ElevationProfileController from './elevation-profile.controller';
import ElevationProfileDirective from './elevation-profile.directive';
import c2cLang from '../lang/lang.module';

export default angular
  .module('c2c.elevation-profile', [
    c2cLang
  ])
  .controller('ElevationProfileController', ElevationProfileController)
  .directive('c2cElevationProfile', ElevationProfileDirective)
  .name;
