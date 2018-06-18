import angular from 'angular';
import AuthController from './auth.controller';
import AuthDirective from './auth.directive';

export default angular
  .module('c2c.auth', [])
  .controller('AuthController', AuthController)
  .directive('c2cAuth', AuthDirective)
  .name;
