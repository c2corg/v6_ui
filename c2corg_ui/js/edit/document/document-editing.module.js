import DocumentEditingController from './document-editing.controller';
import DocumentEditingDirective from './document-editing.directive';

export default angular
  .module('c2c.edit.document', [])
  .controller('DocumentEditingController', DocumentEditingController)
  .directive('c2cDocumentEditing', DocumentEditingDirective)
  .name;
