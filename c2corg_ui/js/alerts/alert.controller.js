/**
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @ngInject
 * @export
 */
export default class AlertController {
  constructor($timeout) {
    'ngInject';

    this.$timeout = $timeout;
  }

  $onInit() {
    if (this.timeout && this.close) {
      const timeout = parseInt(this.timeout, 10);
      if (timeout) {
        this.$timeout(() => {
          this.close();
        }, timeout);
      }
    }
  }
}
