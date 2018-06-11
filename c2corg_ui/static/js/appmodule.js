/**
 * @module app
 */
const exports = {};

/**
 * @fileoverview This file defines the application's Angular module.
 */

/** @suppress {extraRequire} */
import ngeoBase from 'ngeo.js';


// create fake modules for dependencies of ngeo that are not used
// see https://github.com/camptocamp/ngeo/issues/2004
angular.module('ui.date', []);
angular.module('floatThead', []);

/**
 * @const
 * @type {!angular.Module}
 */
exports.module = angular.module('app', [
  ngeoBase.module.name,
  'gettext',
  'ngMessages',
  'ngCookies',
  'ui.bootstrap',
  'angularMoment',
  'ngFileUpload',
  'slug',
  'vcRecaptcha',
  'infinite-scroll',
  'ngSanitize'
]);


export default exports;
