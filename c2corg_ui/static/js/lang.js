goog.provide('app.LangController');
goog.provide('app.langDirective');

goog.require('app');
goog.require('app.Lang');


/**
 * This directive is used to display a lang selector dropdown.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.langDirective = function() {
  return {
    restrict: 'E',
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
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @export
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
    this.langService_.updateLang(lang);
  }
};


app.module.controller('AppLangController', app.LangController);
