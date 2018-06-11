/**
 * @module app.MailinglistsController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
const exports = function(appAuthentication, appApi, authUrl) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {Object}
   * @export
   */
  this.mailinglists = null;

  if (appAuthentication.isAuthenticated()) {
    this.api_.readMailinglists().then((response) => {
      this.mailinglists = response['data'];
    });
  } else {
    appUtils.redirectToLogin(authUrl);
  }
};


/**
 * @param {string} listname
 * @export
 */
exports.prototype.toggle = function(listname) {
  goog.asserts.assert(listname in this.mailinglists);
  const data = {};
  data[listname] = !this.mailinglists[listname];
  this.api_.updateMailinglists(data);
};


appBase.module.controller('appMailinglistsController', exports);


export default exports;
