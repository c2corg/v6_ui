goog.provide('app.MainController');

goog.require('app');
goog.require('app.HttpAuthenticationInterceptor');


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @export
 * @ngInject
 */
app.MainController = function(gettextCatalog) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;
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
