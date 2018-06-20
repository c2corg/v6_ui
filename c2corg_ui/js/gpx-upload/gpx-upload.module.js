import angular from 'angular';
import GpxUploadController from './gpx-upload.controller';
import GpxUploadDirective from './gpx-upload.directive';

export default angular
  .module('c2c.gpx-upload', [])
  .controller('GpxUploadController', GpxUploadController)
  .directive('c2cGpxUpload', GpxUploadDirective)
  .name;
