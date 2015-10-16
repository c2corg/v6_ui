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


/**
 * @param {number} id Document id.
 * @param {string} culture Document culture.
 * @export
 */
app.WaypointController.prototype.feedModel = function(id, culture) {
  alert('get WP from API' + id + culture);
};


app.module.controller('WaypointController', app.WaypointController);
