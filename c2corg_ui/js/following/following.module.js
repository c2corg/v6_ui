import angular from 'angular';
import FollowingController from './following.controller';
import FollowingDirective from './following.directive';
import c2cApi from '../api/api.module';
import c2cUtils from '../utils/utils.module';
import c2cAuthentication from '../authentication/authentication.module';

export default angular
  .module('c2c.following', [
    c2cUtils,
    c2cApi,
    c2cAuthentication
  ])
  .controller('FollowingController', FollowingController)
  .directive('c2cFollowing', FollowingDirective)
  .name;
