import angular from 'angular';
import OutingEditingController from './outing-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.edit.outing', [
    c2cDocumentEditing,
    c2cUtils,
    ngeoStatemanagerModule.name
  ])
  .controller('OutingEditingController', OutingEditingController)
  .name;
