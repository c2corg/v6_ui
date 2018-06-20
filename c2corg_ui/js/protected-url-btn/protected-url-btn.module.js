import angular from 'angular';
import c2cAuthentication from '../authentication/authentication.module';
import ProtectUrlBtnController from './protected-url-btn.controller';
import ProtectedUrlBtnDirective from './protected-url.directive';

export default angular
  .module('c2c.protected-url-btn', [
    c2cAuthentication
  ])
  .controller('ProtectedUrlBtnController', ProtectUrlBtnController)
  .directive('c2cProtectedUrlBtn', ProtectedUrlBtnDirective)
  .name;
