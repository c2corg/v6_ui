/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 */
export default class DeleteAssociationModalController {
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
  close(action) {
    this.modalInstance_.close(action);
  }


  /**
   * @export
   */
  dismiss() {
    this.modalInstance_.close();
  }
}
