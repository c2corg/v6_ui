import angular from 'angular';
import VersionsController from './versions.controller';
import VersionsDirective from './versions.directive';

export default angular
  .module('c2c.versions', [])
  .controller('VersionsController', VersionsController)
  .directive('c2cVersions', VersionsDirective)
  .name;
