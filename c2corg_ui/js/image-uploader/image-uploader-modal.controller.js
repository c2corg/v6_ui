/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.ImageUploaderModalController}
 */
export default class ImageUploaderModalController {
  constructor($scope, $uibModalInstance) {
    'ngInject';

    /**
     * @type {!angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {Object} $uibModalInstance angular bootstrap
     * @private
     */
    this.modalInstance_ = $uibModalInstance;

    $scope.$on('modal.closing', (event, reason, closed) => {
      this.scope_['uplCtrl'].abortAllUploads();
    });
  }


  /**
   * @export
   */
  close() {
    if (!this.scope_['uplCtrl'].saving) {
      this.modalInstance_.close();
    }
  }


  /**
   * @export
   */
  save() {
    const uplCtrl = this.scope_['uplCtrl'];
    if (uplCtrl.saving) {
      // saving is already in progress
      return;
    }
    uplCtrl.saving = true;
    uplCtrl.save().then(() => {
      uplCtrl.saving = false;
      this.modalInstance_.close();
    });
  }
}
