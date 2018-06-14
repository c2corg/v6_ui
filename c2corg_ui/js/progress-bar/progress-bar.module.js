import angular from 'angular';
import c2cConstants from '../constants/constants.module';
import ProgressBarController from './progress-bar.controller';
import ProgressBarDirective from './progress-bar.directive';

export default angular
  .module('c2c.progress-bar', [
    c2cConstants
  ])
  .controller('ProgressBarController', ProgressBarController)
  .directive('c2cProgressbar', ProgressBarDirective)
  .name;
