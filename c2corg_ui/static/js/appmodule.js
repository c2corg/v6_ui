/**
 * @fileoverview This file defines the application's Angular module.
 */
goog.provide('app');

/** @suppress {extraRequire} */
goog.require('ngeo');


// create fake modules for dependencies of ngeo that are not used
// see https://github.com/camptocamp/ngeo/issues/2004
angular.module('ui.date', []);
angular.module('floatThead', []);

/**
 * @const
 * @type {!angular.Module}
 */
app.module = angular.module('app', [
  ngeo.module.name,
  'angular-loading-bar',
  'ngAnimate',
  'gettext',
  'ngMessages',
  'ngCookies',
  'ui.bootstrap',
  'angularMoment',
  'ngFileUpload',
  'slug',
  'vcRecaptcha',
  'infinite-scroll',
  'debounce'
]);
