import OutingEditingController from './article-outing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';

export default angular
  .module('c2c.edit.outing', [c2cDocumentEditing, c2cUtils])
  .controller('OutingEditingController', OutingEditingController)
  .name;
