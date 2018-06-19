import angular from 'angular';
import DeleteDocumentController from './delete-document.controller';
import DeleteDocumentDirective from './delete-document.directive';
import c2cApi from '../api/api.module';

export default angular
  .module('c2c.delete-document', [
    c2cApi
  ])
  .controller('DeleteDocumentController', DeleteDocumentController)
  .directive('c2cDeleteDocument', DeleteDocumentDirective)
  .name;
