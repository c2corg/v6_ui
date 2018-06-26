import angular from 'angular';
import DocumentEditingController from './document-editing.controller';
import ConfirmSaveController from './confirm-save.controller';
import DocumentEditingDirective from './document-editing.directive';
import c2cConstants from '../../constants/constants.module';
import PreviewModalController from './preview-modal.controller';
import MarkdownEditorDirective from './markdown-editor.directive';
import LengthConverterDirective from './length-converter.directive';

export default angular
  .module('c2c.edit.document', [c2cConstants])
  .controller('DocumentEditingController', DocumentEditingController)
  .controller('ConfirmSaveController', ConfirmSaveController)
  .controller('PreviewModalController', PreviewModalController)
  .directive('c2cDocumentEditing', DocumentEditingDirective)
  .directive('c2cMarkdownEditor', MarkdownEditorDirective)
  .directive('c2cLengthConverter', LengthConverterDirective)
  .name;
