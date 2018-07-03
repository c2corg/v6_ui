import angular from 'angular';
import ApiService from './api.service';
import c2cAlerts from '../alerts/alerts.module';

export default angular
  .module('c2c.api', [c2cAlerts])
  .service('ApiService', ApiService)
  .name;
