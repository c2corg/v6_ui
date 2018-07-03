import angular from 'angular';
import ContextHelpDirective from './context-help.directive';
import ContextHelpModalController from './context-help-modal.controller';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c.context-help', [c2cUtils])
  .directive('c2cContextHelp', ContextHelpDirective)
  .controller('ContextHelpModalController', ContextHelpModalController)
  .name;
