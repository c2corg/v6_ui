import angular from 'angular';
import RouteEditingController from './route-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.edit.route', [
    c2cDocumentEditing,
    c2cUtils,
    ngeoStatemanagerModule.name
  ])
  .controller('RouteEditingController', RouteEditingController)
  .name;
