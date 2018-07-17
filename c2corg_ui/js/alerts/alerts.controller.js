/**
 * @constructor
 * @param {app.Alerts} AlertsService Alert service.
 * @ngInject
 */
export default class AlertsController {
  constructor($rootScope, AlertsService) {
    'ngInject';

    this.alertsService_ = AlertsService;

    /**
     * @type {Array.<appx.AlertMessage>}
     * @export
     */
    this.alerts = AlertsService.get();

    $rootScope.$on('alertsUpdated', () => this.alerts = this.alertsService_.get());
  }


  /**
   * @param {number} index Index of alert to close.
   * @export
   */
  close(index) {
    $('.loading').removeClass('loading');
    this.alertsService_.remove(index);
  }
}
