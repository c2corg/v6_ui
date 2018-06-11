/**
 * @module app.Alerts
 */
import appBase from './index.js';

/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 */
const exports = function(gettextCatalog) {

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
exports.prototype.gettext = function(str) {
  return str;
};


/**
 * @param {appx.AlertMessage} data Alert data.
 * @export
 */
exports.prototype.add = function(data) {
  const timeout = data['timeout'] || 0;
  this.addLoading_(timeout);
  let msg = data['msg'];
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
exports.prototype.addSuccess = function(msg) {
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
exports.prototype.addError = function(msg) {
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
exports.prototype.addErrorWithMsg = function(msg, errors) {
  const content = this.filterStr_(msg) + '<br>' + this.formatErrorMsg_(errors);
  const timeout = 5000;
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
exports.prototype.get = function() {
  return this.alerts_;
};


/**
 * @param {number} timeout
 * @private
 */
exports.prototype.addLoading_ = function(timeout) {
  $('main, aside, .page-header').addClass('loading');
  setTimeout(() => {
    $('main, aside, .page-header').removeClass('loading');
  }, timeout);
};


/**
 * @param {Object} response Response from the API server.
 * @return {string}
 * @private
 */
exports.prototype.formatErrorMsg_ = function(response) {
  if (!('data' in response) || !response['data'] ||
      !('errors' in response['data']) ||
      !response['data']['errors']) {
    return this.gettextCatalog_.getString('Unknown error');
  }
  const errors = response['data']['errors'];
  const len = errors.length;
  if (len > 1) {
    let msg = '<ul>';
    for (let i = 0; i < len; i++) {
      msg += '<li>' + this.filterStr_(errors[i]['name']) + ' : ' + this.filterStr_(errors[i]['description']) + '</li>';
    }
    return msg + '</ul>';
  }
  return this.filterStr_(errors[0]['name']) + ' : ' + this.filterStr_(errors[0]['description']);
};


/**
 * @param {string} str String to filter.
 * @return {string}
 * @private
 */
exports.prototype.filterStr_ = function(str) {
  // FIXME use lodash str = _.escape(str);
  return this.gettextCatalog_.getString(str);
};


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @private
 * @ngInject
 * @return {app.Alerts}
 */
appBase.AlertsFactory_ = function(gettextCatalog) {
  return new exports(gettextCatalog);
};
appBase.module.factory('appAlerts', appBase.AlertsFactory_);


export default exports;
