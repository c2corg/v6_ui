goog.provide('app.ContextHelpModalController');

goog.require('app');


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {ui.bootstrap.modalInstance} $uibModalInstance modal from angular bootstrap
 * @param {string} content
 * @param {string} title
 * @constructor
 * @ngInject
 * @returns {app.ContextHelpModalController}
 */
app.ContextHelpModalController = function($uibModalInstance, content, title) {
  /**
   * @type {string}
   * @export
   */
  this.content = content;

  /**
   * @type {string}
   * @export
   */
  this.title = title;

  /**
   * @type {ui.bootstrap.modalInstance} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};

app.ContextHelpModalController.prototype.close = function() {
  this.modalInstance_.close();
};


app.module.controller('AppContextHelpModalController', app.ContextHelpModalController);
