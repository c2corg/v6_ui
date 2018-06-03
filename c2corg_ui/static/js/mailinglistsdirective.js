goog.provide('app.mailinglistsDirective');

goog.require('app');


/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.mailinglistsDirective = function() {
  return {
    restrict: 'A',
    controller: 'appMailinglistsController',
    controllerAs: 'mlCtrl'
  };
};


app.module.directive('appMailinglists', app.mailinglistsDirective);
