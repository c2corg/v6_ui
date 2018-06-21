import angular from 'angular';
import simpleSearchController from './simple-search.controller';
import SimpleSearchDirective from './simple-search.directive';
import c2cConstants from '../constants/constants.module';
import c2cDocument from '../document/document.module';
import c2cAuthentication from '../authentication/authentication.module';
import c2cUrl from '../url/url.module';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c.simple-search', [
    c2cConstants,
    c2cAuthentication,
    c2cDocument,
    c2cUrl,
    c2cUtils
  ])
  .controller('SimpleSearchController', simpleSearchController)
  .directive('c2cSimpleSearch', SimpleSearchDirective)
  .name;
