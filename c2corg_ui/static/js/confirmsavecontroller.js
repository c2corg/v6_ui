goog.provide('app.ConfirmSaveController');

goog.require('app');


app.ConfirmSaveController = function() {
};

/**
 * @export
 */
app.ConfirmSaveController.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


app.module.controller('appConfirmSaveModalController', app.ConfirmSaveController);
