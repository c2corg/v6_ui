/**
 * @module app.ProtectedUrlBtnController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} AuthenticationService
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
const exports = function(AuthenticationService, authUrl) {
  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = AuthenticationService;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;
};

exports.prototype.redirectToProtectedUrl = function(url) {
  if (this.auth_.isAuthenticated()) {
    window.location.href = url;
  } else {
    window.location.href = '{authUrl}#to={redirect}'
      .replace('{authUrl}', this.authUrl_)
      .replace('{redirect}', encodeURIComponent(url));
  }
};

appBase.module.controller('AppProtectedUrlBtnController', exports);


export default exports;
