/**
 * @fileoverview Externs for bootstrap-slider
 *
 * @externs
 */


/**
 * @typedef {{
 *  min: number,
 *  max: number,
 *  value: Array.<number>
 * }}
 */
var bootstrapSliderParameters;


/**
 * @param {bootstrapSliderParameters | string} arg
 * @param {*=} opt_value
 * @return {!jQuery}
 */
$.prototype.slider = function(arg, opt_value) {};
