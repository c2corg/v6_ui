import angular from 'angular';
import DocumentEditingController from './document-editing.controller';
import ConfirmSaveController from './confirm-save.controller';
import DocumentEditingDirective from './document-editing.directive';
import c2cConstants from '../../constants/constants.module';
import c2cLang from '../../lang/lang.module';
import c2cAuthentication from '../../authentication/authentication.module';
import c2cAlerts from '../../alerts/alerts.module';
import c2cApi from '../../api/api.module';
import c2cDocument from '../../document/document.module';
import c2cUrl from '../../url/url.module';
import c2cUtils from '../../utils/utils.module';
import PreviewModalController from './preview-modal.controller';
import MarkdownEditorDirective from './markdown-editor.directive';
import LengthConverterDirective from './length-converter.directive';

export default angular
  .module('c2c.edit.document', [
    c2cConstants,
    c2cLang,
    c2cAuthentication,
    c2cAlerts,
    c2cApi,
    c2cDocument,
    c2cUrl,
    c2cUtils
  ])
  .controller('DocumentEditingController', DocumentEditingController)
  .controller('ConfirmSaveController', ConfirmSaveController)
  .controller('PreviewModalController', PreviewModalController)
  .directive('c2cDocumentEditing', DocumentEditingDirective)
  .directive('c2cMarkdownEditor', MarkdownEditorDirective)
  .directive('c2cLengthConverter', LengthConverterDirective)
  .name;
