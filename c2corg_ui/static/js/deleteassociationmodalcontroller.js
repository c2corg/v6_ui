goog.provide('app.DeleteAssociationModalController');

goog.require('app');


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 */
app.DeleteAssociationModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
app.DeleteAssociationModalController.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


/**
 * @export
 */
app.DeleteAssociationModalController.prototype.dismiss = function() {
  this.modalInstance_.close();
};

app.module.controller('AppDeleteAssociationModalController', app.DeleteAssociationModalController);
