import angular from 'angular';
import FollowController from './follow.controller';
import FollowDirective from './follow.directive';
import c2cApi from '../api/api.module';
import c2cAuthentication from '../authentication/authentication.module';

export default angular
  .module('c2c.follow', [
    c2cAuthentication,
    c2cApi
  ])
  .controller('FollowController', FollowController)
  .directive('c2cFollow', FollowDirective)
  .name;
