/**
 * @constructor
 * @param {app.Alerts} AlertsService Alert service.
 * @ngInject
 */
export default class AlertsController {
  constructor(AlertsService) {
    'ngInject';

    /**
     * @type {Array.<appx.AlertMessage>}
     * @export
     */
    this.alerts = AlertsService.get();
  }


  /**
   * @param {number} index Index of alert to close.
   * @export
   */
  close(index) {
    this.alerts.splice(index, 1);
    $('.loading').removeClass('loading');
  }
}
