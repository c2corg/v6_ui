import angular from 'angular';
import XreportEditingController from './xreport-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';

export default angular
  .module('c2c.edit.xreport', [c2cDocumentEditing])
  .controller('XreportEditingController', XreportEditingController)
  .name;
