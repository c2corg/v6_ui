goog.provide('app.AccountController');

goog.require('app');
goog.require('app.Alerts');


/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
app.AccountController = function($scope, appAuthentication, appAlerts,
  appApi, authUrl) {

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
  this.api_ = appApi;

  /**
   * @type {Object}
   * @private
   */
  this.initialData_;

  if (appAuthentication.isAuthenticated()) {
    this.api_.readAccount().then(function(data) {
      this.initialData_ = data['data'];
      $scope['account'] = angular.copy(this.initialData_);
    }.bind(this));
  } else {
    app.utils.redirectToLogin(authUrl);
  }
};


/**
 * @export
 */
app.AccountController.prototype.save = function() {
  var data = this.scope_['account'];
  var modifiedData = {};
  // Only keep modified data
  for (var key in data) {
    if (!(key in this.initialData_) || data[key] !== this.initialData_[key]) {
      modifiedData[key] = data[key];
    }
  }
  var alerts = this.alerts_;
  this.api_.updateAccount(modifiedData).then(function() {
    var msg = alerts.gettext('Update success');
    alerts.addSuccess(msg);
  });
};


app.module.controller('appAccountController', app.AccountController);
