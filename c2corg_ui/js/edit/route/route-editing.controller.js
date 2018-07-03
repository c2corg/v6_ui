import DocumentEditingController from '../document/document-editing.controller';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {Object} $uibModal modal from angular bootstrap.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Lang} LangService Lang service.
 * @param {app.Authentication} AuthenticationService
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} DocumentService
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @extends {app.DocumentEditingController}
 * @ngInject
 */
export default class RouteEditingController extends DocumentEditingController {
  constructor($scope, $attrs, $http, $uibModal, $compile, LangService, AuthenticationService,
    AlertsService, ApiService, authUrl, DocumentService, UrlService, UtilsService, ngeoLocation) {
    'ngInject';

    super($scope, $attrs, $http, $uibModal, $compile, LangService, AuthenticationService, AlertsService,
      ApiService, authUrl, DocumentService, UrlService);

    this.utilsService = UtilsService;

    if (this.auth.isAuthenticated()) {
      // allow association only for a new route to existing waypoint
      if (ngeoLocation.hasFragmentParam('w')) {
        const waypointId = parseInt(ngeoLocation.getFragmentParam('w'), 10);
        ApiService.getDocumentByIdAndDoctype(waypointId, 'w', LangService.getLang()).then(
          (doc) => {
            this.documentService.pushToAssociations(
              doc.data['waypoints'].documents[0],
              'waypoints',
              this.handleAssociation
            );
          }
        );
      }
    }
  }

  /**
   * @param {Array.<string>} activities
   * @return {boolean}
   * @export
   */
  hasActivity(activities) {
    return this.utilsService.hasActivity(this.scope['route'], activities);
  }


  /**
   * @return {boolean}
   * @export
   */
  showRatings() {
    const activities = this.scope['route'].activities;
    if (activities.length === 0) {
      return false;
    } else if (activities.length > 1) {
      return true;
    } else {
      // no rating for slacklining
      return activities[0] !== 'slacklining';
    }
  }


  /**
   * @param {appx.Document} data
   * @param {appx.SimpleSearchDocument} doc
   * @param {string=} doctype Optional doctype
   * @return {appx.Document}
   * @export
   */
  handleAssociation(data, doc,
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
  }
}
