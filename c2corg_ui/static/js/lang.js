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
 * @constructor
 * @export
 * @ngInject
 */
app.LangController = function(gettextCatalog, langUrlTemplate,
    ngeoGetBrowserLanguage) {

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
  this.culture = window.localStorage.getItem('interface_lang') ||
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
  try {
    window.localStorage.setItem('interface_lang', this.culture);
  } catch (e) {
    // The storage is full or we are in incognito mode in a broken browser.
    if (goog.DEBUG) {
      console.log('Failed to save interface language', e);
    }
  }
};


app.module.controller('AppLangController', app.LangController);
