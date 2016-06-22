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
      'langs': '=appLangLangs'
    },
    controller: 'AppLangController',
    controllerAs: 'langCtrl',
    bindToController: true,
    template:
        '<div class="dropdown">' +
        '  <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">' +
        '    <span class="selected-lang">{{langCtrl.lang}}</span>' +
        '    <span class="glyphicon glyphicon-option-vertical"></span>' +
        '  </button>' +
        '  <ul class="dropdown-menu">' +
        '    <li ng-repeat="lang in langCtrl.langs" ng-click="langCtrl.updateLang(lang)"><a>{{lang | translate}}</a></li>' +
        '  </ul>' +
        '</div>'
  };
};


app.module.directive('appLang', app.langDirective);


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {ngeo.GetBrowserLanguage} ngeoGetBrowserLanguage
 *        GetBrowserLanguage Service.
 * @param {angular.$cookies} $cookies Cookies service.
 * @param {amMoment} amMoment angular moment directive.
 * @param {app.Api} appApi Api service.
 * @param {app.Authentication} appAuthentication Authentication service.
 * @constructor
 * @export
 * @ngInject
 */
app.LangController = function(gettextCatalog, langUrlTemplate,
    ngeoGetBrowserLanguage, $cookies, amMoment, appApi, appAuthentication) {

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
   * @type {amMoment}
   */
  this.amMoment_ = amMoment;

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
   */
  var lang = this.cookies_.get('interface_lang') ||
      ngeoGetBrowserLanguage(this['langs']) || 'fr';
  this.updateLang(lang);
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
app.LangController.prototype.updateLang = function(lang) {

  this.lang = lang;
  this.gettextCatalog_.setCurrentLanguage(this.lang);
  this.gettextCatalog_.loadRemote(
          this.langUrlTemplate_.replace('__lang__', this.lang));
  // store the interface language as cookie, so that it is available on the
  // server side.
  this.cookies_.put('interface_lang', this.lang, {
    'path': '/',
    'expires': this.todayInOneYear_()
  });

  if (this.appAuthentication_.isAuthenticated()) {
    this.api_.updatePreferredLanguage(lang);
  }

  if (lang === 'en') {
    lang = 'en-gb';
  }

  // This will retrieve then _evaluate_ the content of the file.
  $.get('/node_modules/moment/locale/' + lang + '.js', function() {
    this.amMoment_.changeLocale(lang);
  }.bind(this));
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
