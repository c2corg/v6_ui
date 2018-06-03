goog.provide('app.PreviewModalController');

goog.require('app');

/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.PreviewModalController}
 */
app.PreviewModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
app.PreviewModalController.prototype.close = function() {
  this.modalInstance_.close();
};


app.module.controller('appPreviewModalController', app.PreviewModalController);
