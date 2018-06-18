import angular from 'angular';
import DocumentService from './document.service';
import c2cUtils from '../utils/utils.module';
import c2cAuthentication from '../authentication/authentication.module';

export default angular
  .module('c2c.document', [
    c2cUtils,
    c2cAuthentication
  ])
  .service('DocumentService', DocumentService)
  .name;
