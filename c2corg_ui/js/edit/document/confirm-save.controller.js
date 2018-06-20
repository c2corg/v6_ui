export default class ConfirmSaveController {
  constructor() {
    'ngInject';
  }

  /**
   * @export
   */
  close(action) {
    this.modalInstance_.close(action);
  }
}
