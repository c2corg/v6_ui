goog.provide('app.MailinglistsController');

goog.require('app');
goog.require('app.utils');


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
app.MailinglistsController = function(appAuthentication, appApi, authUrl) {

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
    app.utils.redirectToLogin(authUrl);
  }
};


/**
 * @param {string} listname
 * @export
 */
app.MailinglistsController.prototype.toggle = function(listname) {
  goog.asserts.assert(listname in this.mailinglists);
  const data = {};
  data[listname] = !this.mailinglists[listname];
  this.api_.updateMailinglists(data);
};


app.module.controller('appMailinglistsController', app.MailinglistsController);
