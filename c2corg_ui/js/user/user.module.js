import angular from 'angular';
import UserDirective from './user.directive';
import UserController from './user.controller';
import c2cAuthentication from '../authentication/authentication.module';
import c2cApi from '../api/api.module';
import c2cUtils from '../utils/utils.module';
import ngeoStatemanagerModule from 'ngeo/statemanager/module';

export default angular
  .module('c2c.user', [
    ngeoStatemanagerModule.name,
    c2cAuthentication,
    c2cApi,
    c2cUtils
  ])
  .controller('UserController', UserController)
  .directive('c2cUser', UserDirective)
  .name;
