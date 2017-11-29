goog.provide('app.RouteEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Alerts');
goog.require('app.Document');
goog.require('app.Lang');
goog.require('app.utils');
/** @suppress {extraRequire} */
goog.require('app.lengthConverterDirective');


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {Object} $uibModal modal from angular bootstrap.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Lang} appLang Lang service.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} appDocument
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @extends {app.DocumentEditingController}
 * @ngInject
 */
app.RouteEditingController = function($scope, $element, $attrs, $http,
    $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
    appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

  if (this.auth.isAuthenticated()) {
    // allow association only for a new route to existing waypoint
    if (ngeoLocation.hasFragmentParam('w')) {
      var waypointId = parseInt(ngeoLocation.getFragmentParam('w'), 10);
      appApi.getDocumentByIdAndDoctype(waypointId, 'w', appLang.getLang()).then(
        function(doc) {
          this.documentService.pushToAssociations(doc.data['waypoints'].documents[0],
                                                  'waypoints',
                                                  this.handleAssociation);
        }.bind(this)
      );
    }
  }
};
goog.inherits(app.RouteEditingController, app.DocumentEditingController);


/**
 * @param {Array.<string>} activities
 * @return {boolean}
 * @export
 */
app.RouteEditingController.prototype.hasActivity = function(activities) {
  return app.utils.hasActivity(this.scope['route'], activities);
};


/**
 * @return {boolean}
 * @export
 */
app.RouteEditingController.prototype.showRatings = function() {
  var activities = this.scope['route'].activities;
  if (activities.length === 0) {
    return false;
  } else if (activities.length > 1) {
    return true;
  } else {
    // no rating for slacklining
    return activities[0] !== 'slacklining';
  }
};


/**
 * @param {appx.Document} data
 * @param {appx.SimpleSearchDocument} doc
 * @param {string=} doctype Optional doctype
 * @return {appx.Document}
 * @export
 */
app.RouteEditingController.prototype.handleAssociation = function(data, doc,
    doctype) {
  // when creating a route, make the first associated wp a main one
  if (!data.document_id && data.associations.waypoints.length === 1) {
    data['main_waypoint_id'] = doc['document_id'];
    if (doc['waypoint_type'] === 'access') {
      data['elevation_min'] = doc['elevation'];
    } else {
      data['elevation_max'] = doc['elevation'];
    }
  }
  return data;
};

app.module.controller('appRouteEditingController', app.RouteEditingController);
