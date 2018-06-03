goog.provide('app.AlertsController');

goog.require('app');


/**
 * @constructor
 * @param {app.Alerts} appAlerts Alert service.
 * @ngInject
 */
app.AlertsController = function(appAlerts) {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @export
   */
  this.alerts = appAlerts.get();
};


/**
 * @param {number} index Index of alert to close.
 * @export
 */
app.AlertsController.prototype.close = function(index) {
  this.alerts.splice(index, 1);
  $('.loading').removeClass('loading');
};


app.module.controller('AppAlertsController', app.AlertsController);
