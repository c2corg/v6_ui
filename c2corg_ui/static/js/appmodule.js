/**
 * @fileoverview This file defines the application's Angular module.
 */
goog.provide('app');

goog.require('ngeo');


/**
 * @const
 * @type {!angular.Module}
 */
app.module = angular.module('app', [ngeoModule.name, 'gettext']);
