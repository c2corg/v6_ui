import angular from 'angular';
import ContextHelpDirective from './context-help.directive';
import ContextHelpModalController from './context-help-modal.controller';
import UtilsService from '../utils/utils.service';

export default angular
  .module('c2c.context-help', [UtilsService])
  .directive('c2cContextHelp', ContextHelpDirective)
  .controller('ContextHelpModalController', ContextHelpModalController)
  .name;
