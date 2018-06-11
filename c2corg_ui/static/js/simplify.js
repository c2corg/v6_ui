/**
 * @module app.simplify
 */
let exports = {};

/**
 * Based on Simplify.js
 *
 * (c) 2013, Vladimir Agafonkin
 * Simplify.js, a high-performance JS polyline simplification library
 * mourner.github.io/simplify-js
 */

import googAsserts from 'goog/asserts.js';
import olGeomLineString from 'ol/geom/LineString.js';
import olGeomMultiLineString from 'ol/geom/MultiLineString.js';


/**
 * square distance between 2 points
 *
 * @param {ol.Coordinate} p1
 * @param {ol.Coordinate} p2
 * @returns {number}
 * @private
 */
exports.getSqDist_ = function(p1, p2) {

  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];

  return dx * dx + dy * dy;
};


// square distance from a point to a segment
/**
 *
 * @param {ol.Coordinate} p
 * @param {ol.Coordinate} p1
 * @param {ol.Coordinate} p2
 * @returns {number}
 * @private
 */
exports.getSqSegDist_ = function getSqSegDist(p, p1, p2) {

  let x = p1[0],
      y = p1[1],
      dx = p2[0] - x,
      dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {

    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2[0];
      y = p2[1];

    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;

  return dx * dx + dy * dy;
};


/**
 * basic distance-based simplification
 *
 * @param {Array.<ol.Coordinate>} points
 * @param {number} sqTolerance
 * @returns {Array.<ol.Coordinate>}
 * @private
 */
exports.simplifyRadialDist_ = function(points, sqTolerance) {

  let prevPoint = points[0];
  const newPoints = [prevPoint];
  let point;

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i];

    if (exports.getSqDist_(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) {
    newPoints.push(point);
  }

  return newPoints;
};


/**
 *
 * @param {Array.<ol.Coordinate>} points
 * @param {number} first
 * @param {number} last
 * @param {number} sqTolerance
 * @param {Array.<ol.Coordinate>} simplified
 * @private
 */
exports.simplifyDPStep_ = function(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance,
      index;

  for (let i = first + 1; i < last; i++) {
    const sqDist = exports.getSqSegDist_(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    googAsserts.assert(index !== undefined);
    if (index - first > 1) {
      exports.simplifyDPStep_(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);
    if (last - index > 1) {
      exports.simplifyDPStep_(points, index, last, sqTolerance, simplified);
    }
  }
};


/**
 * simplification using Ramer-Douglas-Peucker algorithm
 *
 * @param {Array.<ol.Coordinate>} points
 * @param {number} sqTolerance
 * @returns {Array.<ol.Coordinate>}
 * @private
 */
exports.simplifyDouglasPeucker_ = function(points, sqTolerance) {
  const last = points.length - 1;

  const simplified = [points[0]];
  exports.simplifyDPStep_(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
};


/**
 * both algorithms combined for awesome performance
 *
 * @param {Array.<ol.Coordinate>} points
 * @param {number} tolerance
 * @param highestQuality
 * @returns {Array.<ol.Coordinate>}
 * @private
 */
exports.simplify_ = function simplify(points, tolerance, highestQuality) {
  if (points.length <= 2) {
    return points;
  }

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : exports.simplifyRadialDist_(points, sqTolerance);
  points = exports.simplifyDouglasPeucker_(points, sqTolerance);

  return points;
};


/**
 * Simplify line strings and multi line strings. All other geometry types are
 * returned as is.
 *
 * @param {ol.geom.Geometry} geometry
 * @param {number} tolerance
 * @return {ol.geom.Geometry}
 */
exports.simplify = function(geometry, tolerance) {
  if (geometry instanceof olGeomLineString) {
    const coords = geometry.getCoordinates();
    geometry.setCoordinates(exports.simplify_(coords, tolerance, true));
  } else if (geometry instanceof olGeomMultiLineString) {
    const coordss = geometry.getCoordinates();
    const simplifiedCoordss = coordss.map((coords) => {
      return exports.simplify_(coords, tolerance, true);
    });
    geometry.setCoordinates(simplifiedCoordss);
  }
  return geometry;
};


export default exports;
