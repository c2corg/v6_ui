goog.provide('app.ControllerHub');

goog.require('app');



/**
 * @constructor
 * @struct
 */
app.ControllerHub = function() {

  /**
   * @type {Object}
   * @private
   */
  this.controllers_ = {};
};


/**
 * @param {string} name Name of controller to had to the hub.
 * @param {Object} ctrl Controller to had to the hub.
 * @export
 */
app.ControllerHub.prototype.register = function(name, ctrl) {
  this.controllers_[name] = ctrl;
};


/**
 * @param {string} name Name of controller to get.
 * @return {Object} Controller.
 * @export
 */
app.ControllerHub.prototype.get = function(name) {
  return name in this.controllers_ ? this.controllers_[name] : null;
};


/**
 * @type {app.AlertController}
 * @const
 * @export
 */
app.ControllerHub.prototype.alert;


Object.defineProperties(app.ControllerHub.prototype, {
  'alert': {
    /** @this {app.ControllerHub} */
    get: function() {
      return this.get('alert');
    }
  }
});


/**
 * @private
 * @return {app.ControllerHub}
 */
app.ControllerHubFactory_ = function() {
  return new app.ControllerHub();
};
app.module.factory('appControllerHub', app.ControllerHubFactory_);
