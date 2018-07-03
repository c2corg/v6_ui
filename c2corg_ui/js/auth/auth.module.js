import angular from 'angular';
import AuthController from './auth.controller';
import AuthDirective from './auth.directive';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';
import c2cAlerts from '../alerts/alerts.module';

export default angular
  .module('c2c.auth', [
    c2cAlerts,
    ngeoStatemanagerModule.name
  ])
  .controller('AuthController', AuthController)
  .directive('c2cAuth', AuthDirective)
  .name;
