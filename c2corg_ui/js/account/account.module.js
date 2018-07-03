import angular from 'angular';
import AccountController from './account.controller';
import c2cUtils from '../utils/utils.module';
import c2cAlerts from '../alerts/alerts.module';

export default angular
  .module('c2c-account', [
    c2cUtils,
    c2cAlerts
  ])
  .controller('AccountController', AccountController)
  .name;
