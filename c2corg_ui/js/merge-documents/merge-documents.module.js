import angular from 'angular';
import MergeDocumentsController from './merge-documents.controller';
import MergeDocumentsDirective from './merge-documents.directive';
import c2cApi from '../api/api.module';

export default angular
  .module('c2c.merge-documents', [
    c2cApi
  ])
  .controller('MergeDocumentsController', MergeDocumentsController)
  .directive('c2cMergeDocuments', MergeDocumentsDirective)
  .name;
