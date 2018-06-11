/**
 * @module app.AlertsController
 */
import appBase from './index.js';

/**
 * @constructor
 * @param {app.Alerts} appAlerts Alert service.
 * @ngInject
 */
const exports = function(appAlerts) {

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
exports.prototype.close = function(index) {
  this.alerts.splice(index, 1);
  $('.loading').removeClass('loading');
};


appBase.module.controller('AppAlertsController', exports);


export default exports;
