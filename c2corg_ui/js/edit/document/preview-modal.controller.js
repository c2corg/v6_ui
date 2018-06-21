/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.PreviewModalController}
 */
export default class PreviewModalController {
  constructor($uibModalInstance) {
    'ngInject';

    /**
     * @type {Object} $uibModalInstance angular bootstrap
     * @private
     */
    this.modalInstance_ = $uibModalInstance;
  }


  /**
   * @export
   */
  close() {
    this.modalInstance_.close();
  }
}
