goog.provide('app.UserController');
goog.provide('app.userDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('ngeo.Location');


/**
 * This directive is used to display the user tools if authenticated or
 * the sign up button if not.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.userDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppUserController',
    controllerAs: 'userCtrl',
    bindToController: true,
    templateUrl: '/static/partials/user.html'
  };
};

app.module.directive('appUser', app.userDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @export
 * @ngInject
 */
app.UserController = function(appAuthentication, ngeoLocation,
    appAlerts, appApi, authUrl) {

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

  if (this.ngeoLocation_.hasParam('logout')) {
    // Logout from API by removing User data
    this.auth.removeUserData();
    window.location.href = document.referrer;
  }
};


/**
 * @export
 */
app.UserController.prototype.showLogin = function() {
  var current_url = this.ngeoLocation_.getUriString();
  window.location.href = '{login}?from={current}'
      .replace('{login}', this.authUrl_)
      .replace('{current}', encodeURIComponent(current_url));
};


/**
 * @export
 */
app.UserController.prototype.logout = function() {
  this.api_.logoutFromApiAndDiscourse().then(function() {
    this.alerts_.addSuccess('You have been disconnected');
  }.bind(this)).finally(function() {
    this.auth.removeUserData();
    var path = this.ngeoLocation_.getPath();
    if (path.indexOf('/edit/') !== -1 || path.indexOf('/account') !== -1) {
      // The user is editing a document or viewing the account configuration.
      // Going to the authentication page.
      this.showLogin();
    }
  }.bind(this));
};


/**
 * @return {boolean}
 * @export
 */
app.UserController.prototype.hasEditRights = function(users) {
  return this.auth.hasEditRights(users);
};

app.module.controller('AppUserController', app.UserController);
