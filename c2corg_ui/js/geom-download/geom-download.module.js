import angular from 'angular';
import GeomDownloadController from './geom-download.controller';
import GeomDownloadDirective from './geom-download.directive';

export default angular
  .module('c2c.geom-download', [])
  .controller('GeomDownloadController', GeomDownloadController)
  .directive('c2cGeomDownload', GeomDownloadDirective)
  .name;
