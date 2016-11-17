goog.provide('app.Lang');

goog.require('app');
goog.require('ngeo.GetBrowserLanguage');


/**
 * @param {angular.$cookies} $cookies Cookies service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ngeo.GetBrowserLanguage} ngeoGetBrowserLanguage
 *        GetBrowserLanguage Service.
 * @param {Array.<string>} langs List of available langs.
 * @param {amMoment} amMoment angular moment directive.
 * @param {app.Api} appApi Api service.
 * @param {app.Authentication} appAuthentication Authentication service.
 * @param {string} langUrlTemplate Language URL template.
 * @param {string} langMomentPath Path to the moment.js language files.
 * @constructor
 * @ngInject
 * @struct
 */
app.Lang = function($cookies, gettextCatalog, ngeoGetBrowserLanguage, langs,
  amMoment, appApi, appAuthentication, langUrlTemplate, langMomentPath) {

  /**
   * @type {angular.$cookies}
   * @private
   */
  this.cookies_ = $cookies;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {ngeo.GetBrowserLanguage}
   * @private
   */
  this.ngeoGetBrowserLanguage_ = ngeoGetBrowserLanguage;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.langs_ = langs;

  /**
   * @type {amMoment}
   */
  this.amMoment_ = amMoment;

  /**
   * @type {string}
   */
  this.langMomentPath_ = langMomentPath;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.appAuthentication_ = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.langUrlTemplate_ = langUrlTemplate;

  this.updateLang(
    this.cookies_.get('interface_lang') ||
    this.ngeoGetBrowserLanguage_(this.langs_) || 'fr'
  );
};


/**
 * @return {Array.<string>}
 */
app.Lang.prototype.getAvailableLangs = function() {
  return this.langs_;
};


/**
 * @export
 * @return {string}
 */
app.Lang.prototype.getLang = function() {
  return this.gettextCatalog_.currentLanguage;
};


/**
 * @export
 * @param {string} str
 * @return {string}
 */
app.Lang.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * @param {string} lang
 * @param {boolean=} opt_syncWithApi
 */
app.Lang.prototype.updateLang = function(lang, opt_syncWithApi) {
  this.gettextCatalog_.setCurrentLanguage(lang);
  this.gettextCatalog_.loadRemote(
          this.langUrlTemplate_.replace('__lang__', lang));
  // store the interface language as cookie, so that it is available on the
  // server side.
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1); // today + 1 year
  this.cookies_.put('interface_lang', lang, {
    'path': '/',
    'expires': d
  });

  if (opt_syncWithApi && this.appAuthentication_.isAuthenticated()) {
    this.api_.updatePreferredLanguage(lang);
  }

  if (lang === 'en') {
    lang = 'en-gb';
  }

  // This will retrieve then _evaluate_ the content of the file.
  $.get(this.langMomentPath_ + '/' + lang + '.js', function() {
    this.amMoment_.changeLocale(lang);
  }.bind(this));
};


app.module.service('appLang', app.Lang);
