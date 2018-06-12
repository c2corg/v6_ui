import XreportEditingController from './xreport-outing.controller';
import c2cDocumentEditing from '../document/document-editing.module';

export default angular
  .module('c2c.edit.xreport', [c2cDocumentEditing])
  .controller('XreportEditingController', XreportEditingController)
  .name;
