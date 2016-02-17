goog.provide('app.AlertController');
goog.provide('app.AlertsController');
goog.provide('app.alertDirective');
goog.provide('app.alertsDirective');

goog.require('app');
goog.require('app.Alerts');
/** @suppress {extraRequire} */
goog.require('app.trustAsHtmlFilter');


/**
 * This directive is used to display feedbacks to user actions.
 * Inspired by angular-ui boostrap alert:
 * https://github.com/angular-ui/bootstrap/blob/master/src/alert/alert.js
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.alertsDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertsController',
    controllerAs: 'alertsCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alerts.html'
  };
};


app.module.directive('appAlerts', app.alertsDirective);


/**
 * @constructor
 * @param {app.Alerts} appAlerts Alert service.
 * @export
 * @ngInject
 */
app.AlertsController = function(appAlerts) {

  /**
   * @type {Array.<appx.AlertMessage>}
   * @export
   */
  this.alerts = appAlerts.get();
};


/**
 * @param {number} index Index of alert to close.
 * @export
 */
app.AlertsController.prototype.close = function(index) {
  this.alerts.splice(index, 1);
  $('.loading').removeClass('loading');
};


app.module.controller('AppAlertsController', app.AlertsController);


/**
 * This directive is used to display one alert message.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.alertDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertController',
    controllerAs: 'alertCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alert.html',
    scope: {
      'type': '@',
      'close': '&',
      'timeout': '@',
      'msg': '@'
    }
  };
};


app.module.directive('appAlert', app.alertDirective);


/**
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @ngInject
 * @export
 */
app.AlertController = function($timeout) {
  if (this['timeout'] && this['close']) {
    var timeout = parseInt(this['timeout'], 10);
    if (timeout) {
      $timeout((function() {
        this['close']();
      }).bind(this), timeout);
    }
  }
};

app.module.controller('AppAlertController', app.AlertController);
