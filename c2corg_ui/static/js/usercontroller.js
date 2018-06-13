/**
 * @module app.UserController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService
 * @param {string} authUrl Base URL of the authentication page.
 * @param {function(string):string} gettext Marker function provided
 *   by angular-gettext.
 * @constructor
 * @ngInject
 */
const exports = function(appAuthentication, ngeoLocation,
  appAlerts, ApiService, authUrl, gettext) {

  /**
   * @type {app.Authentication}
   * @export
   */
  this.auth = appAuthentication;

  /**
   * @type {app.Api}
   * @private
   */
  this.apiService_ = ApiService;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {function(string):string}
   * @private
   */
  this.gettext = gettext;

  if (this.ngeoLocation_.hasParam('logout')) {
    // Logout from API by removing User data
    this.auth.removeUserData();
  }
};


/**
 * @export
 */
exports.prototype.showLogin = function() {
  appUtils.redirectToLogin(this.authUrl_);
};


/**
 * @export
 */
exports.prototype.logout = function() {
  this.apiService_.logoutFromApiAndDiscourse().then(() => {
    this.alerts_.addSuccess(this.gettext('You have been disconnected'));
  }).finally(() => {
    this.auth.removeUserData();
    const path = this.ngeoLocation_.getPath();
    if (path.indexOf('/edit/') !== -1 || path.indexOf('/account') !== -1) {
      // The user is editing a document or viewing the account configuration.
      // Going to the authentication page.
      this.showLogin();
    }
  });
};


/**
 * @param {string} doctype
 * @param {Object} options
 * @param {boolean=} opt_protected
 * @return {boolean}
 * @export
 */
exports.prototype.hasEditRights = function(doctype, options,
  opt_protected) {
  if (opt_protected && !this.isModerator()) {
    return false;
  }
  return this.auth.hasEditRights(doctype, options);
};


/**
 * @return {boolean}
 * @export
 */
exports.prototype.isModerator = function() {
  return this.auth.isModerator();
};

/**
 * @export
 */
exports.prototype.goToOutingsPage = function() {
  window.location.href = '/outings#u=' + this.auth.userData.id;
  window.location.reload();
};

appBase.module.controller('AppUserController', exports);


export default exports;
