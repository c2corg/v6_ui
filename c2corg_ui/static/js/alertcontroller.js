goog.provide('app.AlertController');

goog.require('app');


/**
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @ngInject
 * @export
 */
app.AlertController = function($timeout) {
  if (this['timeout'] && this['close']) {
    const timeout = parseInt(this['timeout'], 10);
    if (timeout) {
      $timeout(() => {
        this['close']();
      }, timeout);
    }
  }
};

app.module.controller('AppAlertController', app.AlertController);
