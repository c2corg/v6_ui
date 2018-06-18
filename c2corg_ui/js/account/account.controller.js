import angular from 'angular';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} AuthenticationService
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
export default class AccountController {
  constructor($scope, AuthenticationService, appAlerts, ApiService, authUrl, UtilsService) {
    'ngInject';

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {app.Alerts}
     * @private
     */
    this.alerts_ = appAlerts;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {Object}
     * @private
     */
    this.initialData_;

    if (AuthenticationService.isAuthenticated()) {
      this.apiService_.readAccount().then((data) => {
        this.initialData_ = data['data'];
        $scope['account'] = angular.copy(this.initialData_);
      });
    } else {
      UtilsService.redirectToLogin(authUrl);
    }
  }


  /**
   * @export
   */
  save() {
    const data = this.scope_['account'];
    const modifiedData = {};
    // Only keep modified data
    for (const key in data) {
      if (!(key in this.initialData_) || data[key] !== this.initialData_[key]) {
        modifiedData[key] = data[key];
      }
    }
    const alerts = this.alerts_;
    this.apiService_.updateAccount(modifiedData).then(() => {
      const msg = alerts.gettext('Update success');
      alerts.addSuccess(msg);
    });
  }
}
