goog.provide('app.Alerts');

goog.require('app');


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
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
 * Use this function to annotate a string for extraction by the
 * gettext extract tool. The call to this function will be eliminated
 * by the Closure compiler when minifying, so it should not have any
 * performance effect.
 * See https://angular-gettext.rocketeer.be/dev-guide/annotate-js/
 * @param {string} str String to have extracted by gettext tool
 * @return {string}
 */
app.Alerts.prototype.gettext = function(str) {
  return str;
};


/**
 * @param {appx.AlertMessage} data Alert data.
 * @export
 */
app.Alerts.prototype.add = function(data) {
  var timeout = data['timeout'] || 0;
  this.addLoading_(timeout);
  var msg = data['msg'];
  msg = msg instanceof Object ? this.formatErrorMsg_(msg) :
      this.filterStr_(msg);
  this.alerts_.push({
    type: data['type'] || 'warning',
    msg: msg,
    timeout: timeout
  });
};


/**
 * @param {(string|Object)} msg
 * @export
 */
app.Alerts.prototype.addSuccess = function(msg) {
  this.add({
    'type': 'success',
    'msg': msg,
    'timeout': 5000
  });
};


/**
 * @param {(string|Object)} msg
 * @export
 */
app.Alerts.prototype.addError = function(msg) {
  this.add({
    'type': 'danger',
    'msg': msg,
    'timeout': 5000
  });
};


/**
 * @param {string} msg
 * @param {Object} errors
 * @export
 */
app.Alerts.prototype.addErrorWithMsg = function(msg, errors) {
  var content = this.filterStr_(msg) + '<br>' + this.formatErrorMsg_(errors);
  var timeout = 5000;
  this.addLoading_(timeout);
  this.alerts_.push({
    type: 'danger',
    msg: content,
    timeout: timeout
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
 * @param {number} timeout
 * @private
 */
app.Alerts.prototype.addLoading_ = function(timeout) {
  $('main, aside, .page-header').addClass('loading');
  setTimeout(function() {
    $('main, aside, .page-header').removeClass('loading');
  }, timeout);
};


/**
 * @param {Object} response Response from the API server.
 * @return {string}
 * @private
 */
app.Alerts.prototype.formatErrorMsg_ = function(response) {
  if (!('data' in response) || !response['data'] ||
      !('errors' in response['data']) ||
      !response['data']['errors']) {
    return this.gettextCatalog_.getString('Unknown error');
  }
  var errors = response['data']['errors'];
  var len = errors.length;
  if (len > 1) {
    var msg = '<ul>';
    for (var i = 0; i < len; i++) {
      msg += '<li>' + this.filterStr_(errors[i]['description']) + ' : ' + this.filterStr_(errors[i]['name']) + '</li>';
    }
    return msg + '</ul>';
  }
  return this.filterStr_(errors[0]['description']) + ' : ' + this.filterStr_(errors[0]['name']);
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
