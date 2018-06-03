goog.provide('app.ListSwitchController');

goog.require('app');


/**
 * @constructor
 * @ngInject
 */
app.ListSwitchController = function() {

  /**
   * @type {boolean}
   * @export
   */
  this.showList = /** @type {boolean} */ (JSON.parse(
    window.localStorage.getItem('showList') || 'false'));
};


/**
 * @export
 */
app.ListSwitchController.prototype.toggle = function() {
  this.showList = !this.showList;
  window.localStorage.setItem('showList', JSON.stringify(this.showList));
};

app.module.controller('appListSwitchController', app.ListSwitchController);
