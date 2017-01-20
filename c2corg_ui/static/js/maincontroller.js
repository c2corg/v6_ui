goog.provide('app.MainController');

goog.require('app');
goog.require('app.utils');
/** @suppress {extraRequire} */
goog.require('app.HttpAuthenticationInterceptor');
/** @suppress {extraRequire} */
goog.require('app.coordinate');
// goog.require('ngprogress');


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Api} appApi The API service
 * @param {app.Authentication} appAuthentication
 * @param {string} authUrl Base URL of the authentication page.
 * @suppress {checkTypes}
 * @constructor
 * @ngInject
 */
app.MainController = function($scope, $timeout, gettextCatalog, appApi, appAuthentication, authUrl, ngProgressFactory) {
  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

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

  /**
   *
   * https://github.com/VictorBjelkholm/ngProgress
   */
  $scope.progressbar = ngProgressFactory.createInstance();
  // ngProgress.setHeight('10px');
  // ngProgress.setColor('#fff');
  $scope.progressbar.start();
  $timeout($scope.progressbar.complete(), 1000);
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
  if (path === location) {
    // path = '/'
    return 'home';
  } else if (path === 'topoguide') {
    return app.utils.isTopoguide(location.substring(1));
  }
  return location.indexOf(path) > -1;
};


/**
 * @export
 */
app.MainController.prototype.animateHeaderIcon = function(e) {
  app.utils.animateHeaderIcon(e);
};


/**
 * @export
 */
app.MainController.prototype.resizeMap = function() {
  this.scope_.$root.$emit('resizeMap');
};
