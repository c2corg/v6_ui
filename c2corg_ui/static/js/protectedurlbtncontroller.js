goog.provide('app.ProtectedUrlBtnController');

goog.require('app');


/**
 * @param {app.Authentication} appAuthentication
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
app.ProtectedUrlBtnController = function(appAuthentication, authUrl) {
  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;
};

app.ProtectedUrlBtnController.prototype.redirectToProtectedUrl = function(url) {
  if (this.auth_.isAuthenticated()) {
    window.location.href = url;
  } else {
    window.location.href = '{authUrl}#to={redirect}'
      .replace('{authUrl}', this.authUrl_)
      .replace('{redirect}', encodeURIComponent(url));
  }
};

app.module.controller('AppProtectedUrlBtnController', app.ProtectedUrlBtnController);
