import angular from 'angular';
import LoadPreferencesController from './load-preferences.controller';
import LoadPreferencesDirective from './load-preferences.directive';
import c2cApi from '../api/api.module';
import ngeoLocation from 'ngeo/statemanager/Location';

export default angular
  .module('c2c.load-preferences', [
    c2cApi,
    ngeoLocation.name
  ])
  .controller('LoadPreferencesController', LoadPreferencesController)
  .directive('c2cLoadPreferences', LoadPreferencesDirective)
  .name;
