/**
 * @module app.AccountController
 */
import appBase from './index.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
const exports = function($scope, appAuthentication, appAlerts,
  ApiService, authUrl) {

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

  if (appAuthentication.isAuthenticated()) {
    this.apiService_.readAccount().then((data) => {
      this.initialData_ = data['data'];
      $scope['account'] = angular.copy(this.initialData_);
    });
  } else {
    appBase.utils.redirectToLogin(authUrl);
  }
};


/**
 * @export
 */
exports.prototype.save = function() {
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
};


appBase.module.controller('appAccountController', exports);


export default exports;
