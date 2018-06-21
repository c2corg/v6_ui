import template from './alert.html';

/**
 * This directive is used to display feedbacks to user actions.
 * Inspired by angular-ui boostrap alert:
 * https://github.com/angular-ui/bootstrap/blob/master/src/alert/alert.js
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const AlertsDirective = function() {
  return {
    restrict: 'E',
    controller: 'AlertsController',
    controllerAs: 'alertsCtrl',
    bindToController: true,
    template
  };
};

export default AlertsDirective;
