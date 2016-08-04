/**
 * @fileoverview Externs for moment
 *
 * @externs
 */


/**
 * @param {Object | string} date
 */
function moment(date) {};


/**
 * Formats the date in given format, for ex. 'YYYY-MM-DD'
 * @param {string} format
 */
moment.prototype.format = function(format) {};

/**
 * Difference in miliseconds between two dates
 * @param {Object | string} date
 * @return {Number}
 */
moment.prototype.diff = function(date) {};

/** @return {(Date | string)} */
moment.prototype.toDate = function() {};
