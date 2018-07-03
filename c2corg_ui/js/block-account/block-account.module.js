import angular from 'angular';
import BlockAccountController from './block-account.controller';
import BlockAccountDirective from './block-account.directive';

export default angular
  .module('c2c.block-account', [])
  .controller('BlockAccountController', BlockAccountController)
  .directive('c2cFeed', BlockAccountDirective)
  .name;
