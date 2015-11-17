goog.provide('app.MainController');

goog.require('app');



/**
 * @param {angular.Scope} $rootScope The rootScope provider.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @constructor
 * @export
 * @ngInject
 */
app.MainController = function($rootScope, gettextCatalog, langUrlTemplate) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {string}
   * @private
   */
  this.langUrlTemplate_ = langUrlTemplate;

  /**
   * @type {string}
   * @export
   */
  this.lang;

  /**
   * Put angular-gettext's translate function on the scope to translate
   * ng-options based dropdown lists. See
   * https://github.com/rubenv/angular-gettext/issues/58
   * @param {string} str String to translate.
   * @return {string} Translated string.
   */
  $rootScope['translate'] = function(str) {
    return gettextCatalog.getString(str);
  };

  this.switchLanguage('fr');
};


/**
 * @param {string} lang Language code.
 * @export
 */
app.MainController.prototype.switchLanguage = function(lang) {
  this.gettextCatalog_.setCurrentLanguage(lang);
  this.gettextCatalog_.loadRemote(
      this.langUrlTemplate_.replace('__lang__', lang));
  this.lang = lang;
};


app.module.controller('MainController', app.MainController);
