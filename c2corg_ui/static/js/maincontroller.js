goog.provide('app.MainController');

goog.require('app');



/**
 * @param {angular.Scope} $rootScope The rootScope provider.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @export
 * @ngInject
 */
app.MainController = function($rootScope, gettextCatalog) {

  /**
   * TODO: use langController instead?
   * Put angular-gettext's translate function on the scope to translate
   * ng-options based dropdown lists. See
   * https://github.com/rubenv/angular-gettext/issues/58
   * @param {string} str String to translate.
   * @return {string} Translated string.
   */
  $rootScope['translate'] = function(str) {
    return gettextCatalog.getString(str);
  };
};


app.module.controller('MainController', app.MainController);
