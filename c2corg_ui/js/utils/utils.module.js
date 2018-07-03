import angular from 'angular';
import UtilsService from './utils.service.js';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.utils', [ngeoStatemanagerModule.name])
  .service('UtilsService', UtilsService)
  .name;
