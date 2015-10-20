goog.provide('app.RouteController');

goog.require('app');
goog.require('app.DocumentController');



/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @extends {app.DocumentController}
 * @export
 * @ngInject
 */
app.RouteController = function(gettextCatalog, langUrlTemplate, apiUrl) {
  goog.base(this, gettextCatalog, langUrlTemplate, apiUrl);
};
goog.inherits(app.RouteController, app.DocumentController);


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.RouteController.prototype.saveEditedDocument = function(isValid) {
  alert('route save data to ' + this.apiUrl);
};


app.module.controller('RouteController', app.RouteController);
