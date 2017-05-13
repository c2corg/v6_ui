goog.provide('app.MapSwitchController');
goog.provide('app.mapSwitchDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.mapSwitchDirective = function() {
  return {
    restrict: 'E',
    controller: 'appMapSwitchController',
    controllerAs: 'MapswitchCtrl',
    templateUrl: '/static/partials/mapswitch.html'
  };
};
app.module.directive('appMapSwitch', app.mapSwitchDirective);


/**
 * @constructor
 * @ngInject
 */
app.MapSwitchController = function() {

  /**
   * @type {boolean}
   * @export
   */
  this.hideMap = /** @type {boolean} */ (JSON.parse(
    window.localStorage.getItem('hideMap') || 'false'));
};


/**
 * @export
 */
app.MapSwitchController.prototype.toggle = function() {
  this.hideMap = !this.hideMap;
  window.localStorage.setItem('hideMap', JSON.stringify(this.hideMap));
};

app.module.controller('appMapSwitchController', app.MapSwitchController);
