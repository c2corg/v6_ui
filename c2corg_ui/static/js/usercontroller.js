goog.provide('app.UserController');

goog.require('app');
goog.require('app.utils');


/**
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi
 * @param {string} authUrl Base URL of the authentication page.
 * @param {function(string):string} gettext Marker function provided
 *   by angular-gettext.
 * @constructor
 * @ngInject
 */
app.UserController = function(appAuthentication, ngeoLocation,
  appAlerts, appApi, authUrl, gettext) {

  /**
   * @type {app.Authentication}
   * @export
   */
  this.auth = appAuthentication;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

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
app.UserController.prototype.showLogin = function() {
  app.utils.redirectToLogin(this.authUrl_);
};


/**
 * @export
 */
app.UserController.prototype.logout = function() {
  this.api_.logoutFromApiAndDiscourse().then(() => {
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
app.UserController.prototype.hasEditRights = function(doctype, options,
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
app.UserController.prototype.isModerator = function() {
  return this.auth.isModerator();
};

/**
 * @export
 */
app.UserController.prototype.goToOutingsPage = function() {
  window.location.href = '/outings#u=' + this.auth.userData.id;
  window.location.reload();
};

app.module.controller('AppUserController', app.UserController);
