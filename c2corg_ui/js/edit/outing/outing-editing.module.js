import angular from 'angular';
import OutingEditingController from './outing-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.edit.outing', [
    c2cDocumentEditing,
    c2cUtils,
    ngeoLocation.name
  ])
  .controller('OutingEditingController', OutingEditingController)
  .name;
