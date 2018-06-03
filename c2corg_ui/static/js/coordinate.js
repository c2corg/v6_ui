goog.provide('app.coordinate');

goog.require('app');
goog.require('ol.coordinate');
goog.require('ol.proj');


/**
 * @return {function(string):string}
 */
app.coordinate = function() {
  return function(coordinateRaw) {
    if (coordinateRaw) {
      const coordinatesRaw = coordinateRaw.split('/');
      const coordinates = [
        parseInt(coordinatesRaw[0], 10),
        parseInt(coordinatesRaw[1], 10)
      ];
      return ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinates));
    }
    return '';
  };
};

app.module.filter('coordinate', app.coordinate);
