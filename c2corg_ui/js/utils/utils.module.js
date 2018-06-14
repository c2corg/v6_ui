import angular from 'angular';
import UtilsService from './utils.service.js';

export default angular
  .module('c2c.utils', [])
  .service('UtilsService', UtilsService)
  .name;
