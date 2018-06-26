import angular from 'angular';
import GpxUploadController from './gpx-upload.controller';
import GpxUploadDirective from './gpx-upload.directive';
import ngeoFilereader from 'ngeo/src/misc/filereaderComponent';

export default angular
  .module('c2c.gpx-upload', [ngeoFilereader.name])
  .controller('GpxUploadController', GpxUploadController)
  .directive('c2cGpxUpload', GpxUploadDirective)
  .name;
