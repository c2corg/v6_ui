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
 * @param {bootstrapSliderParameters} arg
 * @return {!jQuery}
 */
$.prototype.slider = function(arg) {};
