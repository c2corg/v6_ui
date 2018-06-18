/**
 * @module app.MainController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Api} ApiService The API service
 * @param {app.Authentication} AuthenticationService
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
const exports = function($scope, gettextCatalog, ApiService, AuthenticationService, authUrl) {

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
  this.apiService = ApiService;

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


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
exports.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};

/**
 * @param {string} title String page title
 * @return {string} concatenated and translated page title
 * @export
 */
exports.prototype.page_title = function(title) {
  return this.translate(title) + ' - Camptocamp.org';
};

appBase.module.controller('MainController', exports);

/**
 * @param {string} path
 * @export
 * function returning true if the window.location.pathname contains
 * the path parameter. Only exceptions are 'topoguide', where all
 * kinds of documents are associated, and '/' (home).
 * TODO : add an array of possible document types and make a for loop
 */
exports.prototype.isPath = function(path) {
  const location = window.location.pathname;
  if (path === location) {
    // path = '/'
    return 'home';
  } else if (path === 'topoguide') {
    return appUtils.isTopoguide(location.substring(1));
  }
  return location.indexOf(path) > -1;
};


/**
 * @export
 */
exports.prototype.animateHeaderIcon = function(e) {
  appUtils.animateHeaderIcon(e);
};


/**
 * @export
 */
exports.prototype.resizeMap = function() {
  this.scope_.$root.$emit('resizeMap');
};


export default exports;
