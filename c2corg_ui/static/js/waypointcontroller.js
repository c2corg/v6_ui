goog.provide('app.WaypointController');

goog.require('app');
goog.require('app.DocumentController');



/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @extends {app.DocumentController}
 * @export
 * @ngInject
 */
app.WaypointController = function($scope, $http, gettextCatalog,
    langUrlTemplate, apiUrl) {
  goog.base(this, $scope, $http, gettextCatalog, langUrlTemplate, apiUrl);

  /**
   * @type {string}
   * @protected
   */
  this.baseRoute = '/waypoints';

  /**
   * @type {string}
   * @protected
   */
  this.modelname = 'waypoint';
};
goog.inherits(app.WaypointController, app.DocumentController);


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.WaypointController.prototype.saveEditedDocument = function(isValid) {
  app.DocumentController.prototype.saveEditedDocument.call(this, isValid);
};


app.module.controller('WaypointController', app.WaypointController);
