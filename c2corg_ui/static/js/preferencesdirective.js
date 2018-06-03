goog.provide('app.preferencesDirective');

goog.require('app');


/**
 * Directive managing the user preferences.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.preferencesDirective = function() {
  return {
    restrict: 'A',
    controller: 'appPreferencesController',
    controllerAs: 'prefCtrl'
  };
};

app.module.directive('appPreferences', app.preferencesDirective);
