import angular from 'angular';
import RouteEditingController from './route-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';

export default angular
  .module('c2c.edit.route', [c2cDocumentEditing, c2cUtils])
  .controller('RouteEditingController', RouteEditingController)
  .name;
