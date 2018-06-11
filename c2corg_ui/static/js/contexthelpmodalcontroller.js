/**
 * @module app.ContextHelpModalController
 */
import appBase from './index.js';

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
const exports = function($uibModalInstance, content, title) {
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

exports.prototype.close = function() {
  this.modalInstance_.close();
};


appBase.module.controller('AppContextHelpModalController', exports);


export default exports;
