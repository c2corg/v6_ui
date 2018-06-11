/**
 * @module app.ListSwitchController
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
  this.showList = /** @type {boolean} */ (JSON.parse(
    window.localStorage.getItem('showList') || 'false'));
};


/**
 * @export
 */
exports.prototype.toggle = function() {
  this.showList = !this.showList;
  window.localStorage.setItem('showList', JSON.stringify(this.showList));
};

appBase.module.controller('appListSwitchController', exports);


export default exports;
