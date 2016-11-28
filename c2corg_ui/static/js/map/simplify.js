/**
 * Based on Simplify.js
 *
 * (c) 2013, Vladimir Agafonkin
 * Simplify.js, a high-performance JS polyline simplification library
 * mourner.github.io/simplify-js
 */

goog.provide('app.map.simplify');
goog.require('goog.asserts');


/**
 * square distance between 2 points
 *
 * @param {ol.Coordinate} p1
 * @param {ol.Coordinate} p2
 * @returns {number}
 * @private
 */
app.map.simplify.getSqDist_ = function(p1, p2) {

  var dx = p1[0] - p2[0];
  var dy = p1[1] - p2[1];

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
app.map.simplify.getSqSegDist_ = function getSqSegDist(p, p1, p2) {

  var x = p1[0],
      y = p1[1],
      dx = p2[0] - x,
      dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {

    var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

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
app.map.simplify.simplifyRadialDist_ = function(points, sqTolerance) {

  var prevPoint = points[0],
      newPoints = [prevPoint],
      point;

  for (var i = 1, len = points.length; i < len; i++) {
    point = points[i];

    if (app.map.simplify.getSqDist_(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) newPoints.push(point);

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
app.map.simplify.simplifyDPStep_ = function(points, first, last, sqTolerance, simplified) {
  var maxSqDist = sqTolerance,
      index;

  for (var i = first + 1; i < last; i++) {
    var sqDist = app.map.simplify.getSqSegDist_(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    goog.asserts.assert(index !== undefined);
    if (index - first > 1) {
      app.map.simplify.simplifyDPStep_(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);
    if (last - index > 1) {
      app.map.simplify.simplifyDPStep_(points, index, last, sqTolerance, simplified);
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
app.map.simplify.simplifyDouglasPeucker_ = function(points, sqTolerance) {
  var last = points.length - 1;

  var simplified = [points[0]];
  app.map.simplify.simplifyDPStep_(points, 0, last, sqTolerance, simplified);
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
app.map.simplify.simplify_ = function simplify(points, tolerance, highestQuality) {
  if (points.length <= 2) return points;

  var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : app.map.simplify.simplifyRadialDist_(points, sqTolerance);
  points = app.map.simplify.simplifyDouglasPeucker_(points, sqTolerance);

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
app.map.simplify.simplify = function(geometry, tolerance) {
  if (geometry instanceof ol.geom.LineString) {
    var coords = geometry.getCoordinates();
    geometry.setCoordinates(app.map.simplify.simplify_(coords, tolerance, true));
  } else if (geometry instanceof ol.geom.MultiLineString) {
    var coordss = geometry.getCoordinates();
    var simplifiedCoordss = coordss.map(function(coords) {
      return app.map.simplify.simplify_(coords, tolerance, true);
    });
    geometry.setCoordinates(simplifiedCoordss);
  }
  return geometry;
};
