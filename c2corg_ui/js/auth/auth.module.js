import angular from 'angular';
import AuthController from './auth.controller';
import AuthDirective from './auth.directive';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.auth', [ngeoLocation])
  .controller('AuthController', AuthController)
  .directive('c2cAuth', AuthDirective)
  .name;
