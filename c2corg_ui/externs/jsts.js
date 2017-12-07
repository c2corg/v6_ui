/**
 * @fileoverview Externs for JSTS.
 *
 * @externs
 */

/**
 * @const
 */
var jsts = {};

/**
 * @const
 */
jsts.io = {};

/**
 * @constructor
 */
jsts.io.OL3Parser = function() {};

/**
 * @param {ol.geom.Geometry|undefined} feat
 */
jsts.io.OL3Parser.prototype.read = function(feat) {};

/**
 * @param {Object} feat
 */
jsts.io.OL3Parser.prototype.write = function(feat) {};

/**
 * @const
 */
jsts.geom = {};

/**
 * @constructor
 */
jsts.geom.GeometryFactory = function() {};

/**
 * @constructor
 */
jsts.geom.GeometryCollection = function() {};

/**
 * @param {Array<Object>} feats
 * @return {jsts.geom.GeometryCollection}
 */
jsts.geom.GeometryFactory.prototype.createGeometryCollection = function(feats) {};

/**
 */
jsts.geom.GeometryCollection.prototype.union = function() {};
