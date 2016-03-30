goog.provide('app.MainController');

goog.require('app');
/** @suppress {extraRequire} */
goog.require('app.HttpAuthenticationInterceptor');


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Api} appApi The API service
 * @param {app.Authentication} appAuthentication
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @export
 * @ngInject
 */
app.MainController = function(gettextCatalog, appApi, appAuthentication, authUrl) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {app.Api}
   * @export
   */
  this.appApi = appApi;


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


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
app.MainController.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};

/**
 * @param {string} title String page title
 * @return {string} concatenated and translated page title
 * @export
 */
app.MainController.prototype.page_title = function(title) {
  return this.translate(title) + ' - Camptocamp.org';
};

app.module.controller('MainController', app.MainController);

/**
 * @param {string} path
 * @export
 * function returning true if the window.location.pathname contains
 * the path parameter. Only exceptions are 'topoguide', where all
 * kinds of documents are associated, and '/' (home).
 * TODO : add an array of possible document types and make a for loop
 */
app.MainController.prototype.isPath = function(path) {
  var location = window.location.pathname;
  // path = '/'
  if (path === location) {
    return 'home';
  // if topoguide, it can be all kinds of documents
  } else if (path === 'topoguide') {
    return location.indexOf('waypoints') > -1 || location.indexOf('routes') > -1 || location.indexOf('outings') > -1
  } else {
    return location.indexOf(path) > -1;
  }
};


/**
 * @export
 */
app.MainController.prototype.animateHeaderIcon = function(e) {
  app.utils.animateHeaderIcon(e);
}

/**
 * @export
 */
app.MainController.prototype.redirectToProtectedUrl = function(url) {
  if (this.auth_.isAuthenticated()) {
    window.location.href = url;
  } else {
    window.location.href = '{authUrl}?from={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(url));
  }
};
