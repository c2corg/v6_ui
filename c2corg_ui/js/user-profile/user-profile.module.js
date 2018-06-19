import angular from 'angular';
import UserProfileController from './user-profile.controller';
import UserProfileDirective from './user-profile.directive';

export default angular
  .module('c2c.user-profile', [])
  .controller('UserProfileController', UserProfileController)
  .directive('c2cUserProfile', UserProfileDirective)
  .name;
