goog.provide('app.AlertController');
goog.provide('app.alertDirective');

goog.require('app');
goog.require('app.ControllerHub');


/**
 * This directive is used to display feedbacks to user actions.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.alertDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertController',
    controllerAs: 'alertCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alert.html'
  };
};


app.module.directive('appAlert', app.alertDirective);



/**
 * @constructor
 * @param {app.ControllerHub} appControllerHub Controller hub service
 * @export
 * @ngInject
 */
app.AlertController = function(appControllerHub) {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @export
   */
  this.alerts = [];

  appControllerHub.register('alert', this);
};


/**
 * @param {number} index Index of alert to close.
 * @export
 */
app.AlertController.prototype.close = function(index) {
  this.alerts.splice(index, 1);
};


/**
 * @param {string|appx.AlertMessage} msg Alert data.
 * @export
 */
app.AlertController.prototype.addAlert = function(msg) {
  this.alerts.push(typeof msg == 'string' ? {'msg': msg} : msg);
};


app.module.controller('AppAlertController', app.AlertController);
