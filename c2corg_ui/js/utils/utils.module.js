import angular from 'angular';
import UtilsService from './utils.service.js';
import ngeoLocation from 'ngeo/statemanager/module';

export default angular
  .module('c2c.utils', [ngeoLocation.name])
  .service('UtilsService', UtilsService)
  .name;
