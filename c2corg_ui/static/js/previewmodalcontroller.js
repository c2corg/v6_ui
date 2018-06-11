/**
 * @module app.PreviewModalController
 */
import appBase from './index.js';

/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.PreviewModalController}
 */
const exports = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
exports.prototype.close = function() {
  this.modalInstance_.close();
};


appBase.module.controller('appPreviewModalController', exports);


export default exports;
