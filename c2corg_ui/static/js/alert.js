goog.provide('app.AlertController');
goog.provide('app.alertDirective');

goog.require('app');


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
 * @export
 * @ngInject
 */
app.AlertController = function() {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @export
   */
  this.alerts = [];
};


/**
 * @param {number} index Index of alert to close.
 * @export
 */
app.AlertController.prototype.close = function(index) {
  this.alerts.splice(index, 1);
};


/**
 * @param {string|Object} msg Alert data.
 * @export
 */
app.AlertController.prototype.addAlert = function(msg) {
  msg = (typeof msg == 'string') ? {'msg': msg} : msg;
  this.alerts.push(msg);
};


app.module.controller('AppAlertController', app.AlertController);
