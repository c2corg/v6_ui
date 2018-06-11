/**
 * @module app.coordinate
 */
import appBase from './index.js';
import olCoordinate from 'ol/coordinate.js';
import olProj from 'ol/proj.js';

/**
 * @return {function(string):string}
 */
const exports = function() {
  return function(coordinateRaw) {
    if (coordinateRaw) {
      const coordinatesRaw = coordinateRaw.split('/');
      const coordinates = [
        parseInt(coordinatesRaw[0], 10),
        parseInt(coordinatesRaw[1], 10)
      ];
      return olCoordinate.toStringHDMS(olProj.toLonLat(coordinates));
    }
    return '';
  };
};

appBase.module.filter('coordinate', exports);


export default exports;
