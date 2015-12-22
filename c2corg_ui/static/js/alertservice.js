goog.provide('app.Alerts');


goog.require('app');



/**
 * @constructor
 * @export
 */
app.Alerts = function() {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @private
   */
  this.alerts_ = [];
};


/**
 * @param {appx.AlertMessage} msg Alert data.
 * @export
 */
app.Alerts.prototype.add = function(msg) {
  this.alerts_.push({
    type: msg['type'] || 'warning',
    msg: msg['msg'],
    timeout: msg['timeout'] || 0
  });
};


/**
 * @return {Array.<appx.AlertMessage>}
 * @export
 */
app.Alerts.prototype.get = function() {
  return this.alerts_;
};


/**
 * @private
 * @return {app.Alerts}
 */
app.AlertsFactory_ = function() {
  return new app.Alerts();
};
app.module.factory('appAlerts', app.AlertsFactory_);
