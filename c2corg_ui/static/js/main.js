/**
 * @fileoverview Application entry point.
 *
 * This file defines the "app.main" Closure namespace, which is be used as the
 * Closure entry point (see "closure_entry_point" in the "build.json" file).
 */
goog.provide('app.main');

goog.require('app.DocumentController');
goog.require('app.RouteController');
goog.require('app.WaypointController');
goog.require('app.documentEditingDirective');
// FIXME: make a separated main.js file for each document type?
