/**
 * @module app.MapSwitchController
 */
import appBase from './index.js';

/**
 * @constructor
 * @ngInject
 */
const exports = function() {

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
exports.prototype.toggle = function() {
  this.hideMap = !this.hideMap;
  window.localStorage.setItem('hideMap', JSON.stringify(this.hideMap));
};

appBase.module.controller('appMapSwitchController', exports);


export default exports;
