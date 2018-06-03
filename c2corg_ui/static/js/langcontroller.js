goog.provide('app.LangController');

goog.require('app');


/**
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 */
app.LangController = function(appLang) {

  /**
   * @type {app.Lang}
   * @private
   */
  this.langService_ = appLang;

  /**
   * @type {Array.<string>}
   * @export
   */
  this.langs = appLang.getAvailableLangs();

  /**
   * @type {string}
   * @export
   */
  this.lang = appLang.getLang();
};


/**
 * @export
 */
app.LangController.prototype.updateLang = function(lang) {
  if (this.langs.indexOf(lang) > -1) {
    this.lang = lang;
    this.langService_.updateLang(lang, /* syncWithApi */ true);
  }
};


app.module.controller('AppLangController', app.LangController);
