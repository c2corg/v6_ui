import OutingEditingController from './article-outing.controller';
import c2cDocumentEditing from '../document/document-editing.module';

export default angular
  .module('c2c.edit.outing', [ c2cDocumentEditing ])
  .controller('OutingEditingController', OutingEditingController)
  .name;
