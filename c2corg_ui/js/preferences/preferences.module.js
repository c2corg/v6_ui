import angular from 'angular';
import PreferencesController from './preferences.controller';
import PreferencesDirective from './preferences.directive';
import c2cApi from '../api/api.module';
import c2cUtils from '../utils/utils.module';
import c2cAuthentication from '../authentication/authentication.module';

export default angular
  .module('c2c.preferences', [
    c2cApi,
    c2cUtils,
    c2cAuthentication
  ])
  .controller('PreferencesController', PreferencesController)
  .directive('c2cPreferences', PreferencesDirective)
  .name;
