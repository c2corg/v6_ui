import angular from 'angular';
import OutingsCsvDownloadController from './outings-csv-download.controller';
import OutingsCsvDownloadDirective from './outings-csv-download.directive';
import c2cAuthentication from '../authentication/authentication.module';
import c2cApi from '../api/api.module';
import c2cLang from '../lang/lang.module';

export default angular
  .module('c2c.outings-csv-download', [
    c2cApi,
    c2cAuthentication,
    c2cLang
  ])
  .controller('OutingsCsvDownloadController', OutingsCsvDownloadController)
  .directive('c2cOutingsCsvDownload', OutingsCsvDownloadDirective)
  .name;
