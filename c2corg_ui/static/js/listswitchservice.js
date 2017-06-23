goog.provide('app.ListSwitch');

goog.require('app');


/**
 * @constructor
 * @ngInject
 * @struct
 */
app.ListSwitch = function() {
  /**
   * @type {boolean}
   * @export
   */
  this.showList = /** @type {boolean} */ (JSON.parse(
    window.localStorage.getItem('showList') || 'false'));
};


/**
 * @export
 * @returns {boolean}
 */
app.ListSwitch.prototype.toggle = function() {
  this.showList = !this.showList;
  window.localStorage.setItem('showList', JSON.stringify(this.showList));
  return this.showList;
};


/**
 * @export
 * @returns {boolean}
 */
app.ListSwitch.prototype.isList = function() {
  return this.showList;
};


app.module.service('appListSwitch', app.ListSwitch);
