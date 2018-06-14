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
export default class ContextHelpModalController {
  constructor($uibModalInstance, content, title) {
    'ngInject';

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
  }

  close() {
    this.modalInstance_.close();
  }
}
