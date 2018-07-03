import angular from 'angular';
import ProtectDocumentController from './protect-document.controller';
import ProtectDocumentDirective from './protect-document.directive';

export default angular
  .module('c2c.protect-document', [])
  .controller('ProtectDocumentController', ProtectDocumentController)
  .directive('c2cProtectDocument', ProtectDocumentDirective)
  .name;
