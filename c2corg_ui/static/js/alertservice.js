goog.provide('app.Alerts');


goog.require('app');


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @export
 */
app.Alerts = function(gettextCatalog) {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @private
   */
  this.alerts_ = [];

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;
};


/**
 * @param {appx.AlertMessage} data Alert data.
 * @export
 */
app.Alerts.prototype.add = function(data) {
  var msg = data['msg'];
  msg = msg instanceof Object ? this.formatErrorMsg_(msg) :
      this.filterStr_(msg);
  this.alerts_.push({
    type: data['type'] || 'warning',
    msg: msg,
    timeout: data['timeout'] || 0
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
 * @param {Object} response Response from the API server.
 * @return {string}
 * @private
 */
app.Alerts.prototype.formatErrorMsg_ = function(response) {
  var errors = 'errors' in response['data'] ? response['data']['errors'] : [],
      len = errors.length,
      msg = '';
  if (len == 1) {
    msg = this.filterStr_(errors[0]['description']);
  } else if (len > 0) {
    msg = '<ul>';
    for (var i = 0; i < len; i++) {
      msg += '<li>' + this.filterStr_(errors[i]['description']) + '</li>';
    }
    msg += '</ul>';
  }
  return msg;
};


/**
 * @param {string} str String to filter.
 * @return {string}
 * @private
 */
app.Alerts.prototype.filterStr_ = function(str) {
  str = goog.string.htmlEscape(str);
  return this.gettextCatalog_.getString(str);
};


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @private
 * @ngInject
 * @return {app.Alerts}
 */
app.AlertsFactory_ = function(gettextCatalog) {
  return new app.Alerts(gettextCatalog);
};
app.module.factory('appAlerts', app.AlertsFactory_);
