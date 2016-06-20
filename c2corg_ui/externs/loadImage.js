/**
 * @fileoverview Externs for loadImage
 *
 * @externs
 */


/**
 * @const
 */
var loadImage = {};


/**
 * @param {File|Blob} file
 * @param {function(loadImageMetaData)} callback
 * @param {Object=} opt_options
 */
loadImage.parseMetaData = function(file, callback, opt_options) {};


/**
 * @constructor
 */
var loadImageMetaData = function() {};


/**
 * @type {loadImageExif}
 */
loadImageMetaData.prototype.exif;


/**
 * @constructor
 */
var loadImageExif = function() {};


/**
 * @return Object
 */
loadImageExif.prototype.getAll = function() {};
