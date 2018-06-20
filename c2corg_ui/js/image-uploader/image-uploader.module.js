import angular from 'angular';
import c2cApi from '../api/api.module';
import c2cUtils from '../utils/utils.module';
import c2cAuthentication from '../authentication/authentication.module';
import ImageUploaderController from './image-uploader.controller';
import ImageUploaderModalController from './image-uploader-modal.controller';
import ImageUploaderDirective from './image-uploader.directive';

export default angular
  .module('c2c.image-uploader', [
    c2cApi,
    c2cUtils,
    c2cAuthentication
  ])
  .controller('ImageUploaderController', ImageUploaderController)
  .controller('ImageUploaderModalController', ImageUploaderModalController)
  .directive('c2cImageUploader', ImageUploaderDirective)
  .name;
