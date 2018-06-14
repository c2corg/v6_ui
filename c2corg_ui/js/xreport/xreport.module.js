import angular from 'angular';
import XreportController from './xreport.controller';
import XreportDirective from './xreport.directive';

export default angular
  .module('c2c.xreport', [])
  .controller('XreportController', XreportController)
  .directive('c2cXreport', XreportDirective)
  .name;
