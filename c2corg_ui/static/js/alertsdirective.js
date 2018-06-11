/**
 * @module app.alertsDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display feedbacks to user actions.
 * Inspired by angular-ui boostrap alert:
 * https://github.com/angular-ui/bootstrap/blob/master/src/alert/alert.js
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertsController',
    controllerAs: 'alertsCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alerts.html'
  };
};


appBase.module.directive('appAlerts', exports);


export default exports;
