goog.provide('app.ApiErrorController');
goog.provide('app.apiErrorDirective');

goog.require('app');


/**
 * This directive is used to display the API error passed to the HTML
 * templates engine.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.apiErrorDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppApiErrorController',
    bindToController: true,
    link: function(scope, element, attrs, controller) {
      controller.addMsg(element[0].innerText);
    }
  };
};


app.module.directive('appApiError', app.apiErrorDirective);


/**
 * @param {app.Alerts} appAlerts
 * @constructor
 * @export
 * @ngInject
 */
app.ApiErrorController = function(appAlerts) {

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;
};


/**
 * @param {string} msg
 * @export
 */
app.ApiErrorController.prototype.addMsg = function(msg) {
  this.alerts_.addError(msg);
};


app.module.controller('AppApiErrorController', app.ApiErrorController);
