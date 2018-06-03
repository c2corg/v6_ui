goog.provide('app.MapSwitchController');

goog.require('app');


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
