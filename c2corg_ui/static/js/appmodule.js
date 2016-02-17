/**
 * @fileoverview This file defines the application's Angular module.
 */
goog.provide('app');

/** @suppress {extraRequire} */
goog.require('ngeo');


/**
 * @const
 * @type {!angular.Module}
 */
app.module = angular.module('app', [ngeo.module.name, 'gettext', 'ngMessages', 'ngCookies', 'ui.bootstrap']);
