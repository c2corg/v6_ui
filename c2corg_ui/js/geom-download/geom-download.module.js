import angular from 'angular';
import GeomDownloadController from './geom-download.controller';
import GeomDownloadDirective from './geom-download.directive';
import ngeoDownload from 'ngeo/download/service';

export default angular
  .module('c2c.geom-download', [ngeoDownload.name])
  .controller('GeomDownloadController', GeomDownloadController)
  .directive('c2cGeomDownload', GeomDownloadDirective)
  .name;
