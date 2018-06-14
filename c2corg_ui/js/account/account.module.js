import angular from 'angular';
import AccountController from './account.controller';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c-account', [c2cUtils])
  .controller('AccountController', AccountController)
  .name;
