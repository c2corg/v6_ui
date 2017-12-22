goog.provide('app.capitalize');
goog.provide('app.trustAsHtmlFilter');
goog.provide('app.coordinate');

goog.require('app');
goog.require('ol.coordinate');
goog.require('ol.proj');


/**
 * @param {angular.$sce} $sce Angular sce service.
 * @ngInject
 * @return {function(angular.$sce):string}
 */
app.trustAsHtmlFilter = function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
};

app.module.filter('appTrustAsHtml', app.trustAsHtmlFilter);


/**
 * @return {function(string):string}
 */
app.capitalize = function() {
  return function(token) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  };
};

app.module.filter('capitalize', app.capitalize);


/**
 * @return {function(string):string}
 */
app.coordinate = function() {
  return function(coordinateRaw) {
    if (coordinateRaw) {
      let coordinatesRaw = coordinateRaw.split('/');
      let coordinates = [
        parseInt(coordinatesRaw[0], 10),
        parseInt(coordinatesRaw[1], 10)
      ];
      return ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinates));
    }
    return '';
  };
};

app.module.filter('coordinate', app.coordinate);
