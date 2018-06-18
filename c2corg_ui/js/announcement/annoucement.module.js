import angular from 'angular';
import AnnouncementController from './announcement.controller';
import AnnouncementDirective from './announcement.directive';
import c2cApi from '../api/api.module';
import c2cLang from '../lang/lang.module';

export default angular
  .module('c2c.annoucement', [
    c2cApi,
    c2cLang
  ])
  .controller('AnnoucementController', AnnouncementController)
  .directive('c2cAnnoucement', AnnouncementDirective)
  .name;
