goog.provide('app.LangController');
goog.provide('app.langDirective');

goog.require('app');
goog.require('ngeo.GetBrowserLanguage');


/**
 * This directive is used to display a lang selector dropdown.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.langDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'cultures': '=appLangCultures'
    },
    controller: 'AppLangController',
    controllerAs: 'langCtrl',
    bindToController: true,
    template: '<select ' +
        'ng-model="langCtrl.culture" ' +
        'ng-options="culture as langCtrl.translate(culture) ' +
        'for culture in langCtrl.cultures" ' +
        'ng-change="langCtrl.updateCulture()"></select>'
  };
};


app.module.directive('appLang', app.langDirective);



/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {ngeo.GetBrowserLanguage} ngeoGetBrowserLanguage
 *        GetBrowserLanguage Service.
 * @param {angular.$cookies} $cookies Cookies service.
 * @constructor
 * @export
 * @ngInject
 */
app.LangController = function(gettextCatalog, langUrlTemplate,
    ngeoGetBrowserLanguage, $cookies) {

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
   * @type {angular.$cookies}
   * @private
   */
  this.cookies_ = $cookies;

  /**
   * @type {string}
   * @export
   */
  this.culture = this.cookies_.get('interface_lang') ||
      ngeoGetBrowserLanguage(this['cultures']) || 'fr';
  this.updateCulture();
};


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
app.LangController.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * @export
 */
app.LangController.prototype.updateCulture = function() {
  this.gettextCatalog_.setCurrentLanguage(this.culture);
  this.gettextCatalog_.loadRemote(
      this.langUrlTemplate_.replace('__lang__', this.culture));
  // store the interface language as cookie, so that it is available on the
  // server side. the expiration is set to 'session', the cookie will be
  // deleted once the browser is closed.
  this.cookies_.put('interface_lang', this.culture, {
    'path': '/',
    'expires': this.todayInOneYear_()
  });
};


/**
 * @return {Date} Today in one year.
 * @private
 */
app.LangController.prototype.todayInOneYear_ = function() {
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};


app.module.controller('AppLangController', app.LangController);
