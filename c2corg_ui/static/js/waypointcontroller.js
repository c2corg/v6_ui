goog.provide('app.WaypointController');

goog.require('app');
goog.require('app.DocumentController');



/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @constructor
 * @extends {app.DocumentController}
 * @export
 * @ngInject
 */
app.WaypointController = function(gettextCatalog, langUrlTemplate) {
  goog.base(this, gettextCatalog, langUrlTemplate);
};
goog.inherits(app.WaypointController, app.DocumentController);


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.WaypointController.prototype.saveEditedDocument = function(isValid) {
  alert('wp save data');
};


app.module.controller('WaypointController', app.WaypointController);
