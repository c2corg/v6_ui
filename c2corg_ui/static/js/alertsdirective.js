goog.provide('app.alertsDirective');

goog.require('app');


/**
 * This directive is used to display feedbacks to user actions.
 * Inspired by angular-ui boostrap alert:
 * https://github.com/angular-ui/bootstrap/blob/master/src/alert/alert.js
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.alertsDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertsController',
    controllerAs: 'alertsCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alerts.html'
  };
};


app.module.directive('appAlerts', app.alertsDirective);
