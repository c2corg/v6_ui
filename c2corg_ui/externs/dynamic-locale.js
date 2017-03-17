/**
 * @fileoverview Externs for angular-dynamic-locale
 *
 * @externs
 */

/**
 * @constructor
 */
function tmhDynamicLocale() {};


/**
 * change angular.$locale
 * @param {string} lang
 */
tmhDynamicLocale.prototype.set = function(lang) {};


/**
 * @constructor
 */
function tmhDynamicLocaleProvider() {};

/**
 * override the default path (angular/i18n/angular-locale_{{locale}}.js)
 * @param {string} url
 */
tmhDynamicLocaleProvider.prototype.localeLocationPattern = function(url) {};
