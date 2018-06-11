/**
 * @module app.ConfirmSaveController
 */
import appBase from './index.js';

const exports = function() {
};

/**
 * @export
 */
exports.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


appBase.module.controller('appConfirmSaveModalController', exports);


export default exports;
