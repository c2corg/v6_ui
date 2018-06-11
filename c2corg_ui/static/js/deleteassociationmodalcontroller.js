/**
 * @module app.DeleteAssociationModalController
 */
import appBase from './index.js';

/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
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
exports.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


/**
 * @export
 */
exports.prototype.dismiss = function() {
  this.modalInstance_.close();
};

appBase.module.controller('AppDeleteAssociationModalController', exports);


export default exports;
