import angular from 'angular';
import ViewDetailsController from './view-details.controller';
import ViewDetailsDirective from './view-details.directive';
import c2cApi from '../api/api.module';
import c2cDocument from '../document/document.module';
import c2cLang from '../lang/lang.module';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c.view-details', [
    c2cApi,
    c2cDocument,
    c2cLang,
    c2cUtils
  ])
  .controller('ViewDetailsController', ViewDetailsController)
  .directive('c2cViewDetails', ViewDetailsDirective)
  .name;

