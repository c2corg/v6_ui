/**
 * @fileoverview Externs for moment
 *
 * @externs
 */


/**
 * @param {(Object | string)=} date
 * @param {string=} opt_format
 */
function moment(date, opt_format) {}

/**
 * Formats the date in given format, for ex. 'YYYY-MM-DD'
 * @param {string=} opt_format
 */
moment.prototype.format = function(opt_format) {};

/**
 * @return {boolean}
 */
moment.prototype.isValid = function() {};

/**
 * Difference in miliseconds between two dates
 * @param {Object | string} date
 * @return {Number}
 */
moment.prototype.diff = function(date) {};

/** @return {(Date | string)} */
moment.prototype.toDate = function() {};
