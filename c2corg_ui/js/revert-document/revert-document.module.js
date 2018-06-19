import angular from 'angular';
import RevertDocumentController from './revert-document.controller';
import RevertDocumentDirective from './revert-document.directive';
import c2cApi from '../api/api.module';
import c2cAuthentication from '../authentication/authentication.module';

export default angular
  .module('c2c.revert-document', [
    c2cApi,
    c2cAuthentication
  ])
  .controller('RevertDocumentController', RevertDocumentController)
  .directive('c2cRevertDocument', RevertDocumentDirective)
  .name;
