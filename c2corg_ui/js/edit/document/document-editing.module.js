import DocumentEditingController from './document-editing.controller';
import DocumentEditingDirective from './document-editing.directive';
import c2cConstants from '../../constants/constants.module';

export default angular
  .module('c2c.edit.document', [c2cConstants])
  .controller('DocumentEditingController', DocumentEditingController)
  .directive('c2cDocumentEditing', DocumentEditingDirective)
  .name;
