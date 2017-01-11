goog.provide('app.GeolocationController');
goog.provide('app.geolocationDirective');

goog.require('app');
/** @suppress {extraRequire} */
goog.require('ngeo.mobileGeolocationDirective');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * This directive is used to display a "center on my position" button.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.geolocationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppGeolocationController',
    controllerAs: 'geoCtrl',
    bindToController: true,
    scope: {
      'map': '=appGeolocationMap'
    },
    templateUrl: '/static/partials/map/geolocation.html'
  };
};

app.module.directive('appGeolocation', app.geolocationDirective);


/**
 * @constructor
 * @struct
 * @ngInject
 */
app.GeolocationController = function() {

  /**
   * @type {ol.Map}
   * @export
   */
  this.map;

  var positionFeatureStyle = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({color: 'rgba(230, 100, 100, 1)'}),
      stroke: new ol.style.Stroke({color: 'rgba(230, 40, 40, 1)', width: 2})
    })
  });

  var accuracyFeatureStyle = new ol.style.Style({
    fill: new ol.style.Fill({color: 'rgba(100, 100, 230, 0.3)'}),
    stroke: new ol.style.Stroke({color: 'rgba(40, 40, 230, 1)', width: 2})
  });

  /**
   * @type {ngeox.MobileGeolocationDirectiveOptions}
   * @export
   */
  this.mobileGeolocationOptions = {
    positionFeatureStyle: positionFeatureStyle,
    accuracyFeatureStyle: accuracyFeatureStyle,
    zoom: 14
  };
};


app.module.controller('AppGeolocationController', app.GeolocationController);
