/**
 * @module app.AlertController
 */
import appBase from './index.js';

/**
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @ngInject
 * @export
 */
const exports = function($timeout) {
  if (this['timeout'] && this['close']) {
    const timeout = parseInt(this['timeout'], 10);
    if (timeout) {
      $timeout(() => {
        this['close']();
      }, timeout);
    }
  }
};

appBase.module.controller('AppAlertController', exports);


export default exports;
