import angular from 'angular';
import ImageEditingController from './image-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';
import c2cUtils from '../../utils/utils.module';

export default angular
  .module('c2c.edit.image', [c2cDocumentEditing, c2cUtils])
  .controller('ImageEditingController', ImageEditingController)
  .name;
