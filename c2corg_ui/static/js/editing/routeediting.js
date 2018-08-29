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
      const waypointId = parseInt(ngeoLocation.getFragmentParam('w'), 10);
      appApi.getDocumentByIdAndDoctype(waypointId, 'w', appLang.getLang()).then(
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
  const activities = this.scope['route'].activities;
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

/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.RouteEditingController.prototype.presetQuality = function(doc) {
  let score = 0;
  let score_climb = 0;
  let score_other_activities = 0;
  const activities = doc['activities'];

  let score_wp = 0;
  if (doc['associations']['waypoints'].length > 1) {
    score_wp = 1;
  }

  let score_geometry = 0;
  if ('geometry' in doc && doc['geometry']) {
    const geometry = doc['geometry'];
    if ('geom_detail' in geometry && geometry['geom_detail']) {
      score_geometry = 1;
    }
  }

  let score_configuration = 0;
  if (doc['route_types'] ||
      doc['rock_types'] ||
      'orientations' in doc && doc['orientations'].length > 0 ||
      'configuration' in doc && doc['configuration'].length > 0) {
    score_configuration = 1;
  }

  let score_figures = 0;
  if ('elevation_min' in doc && doc['elevation_min'] ||
      'elevation_max' in doc && doc['elevation_max'] ||
      'height_diff_up' in doc && doc['height_diff_up'] ||
      'height_diff_down' in doc && doc['height_diff_down'] ||
      'height_diff_access' in doc && doc['height_diff_access'] ||
      'height_diff_difficulties' in doc && doc['height_diff_difficulties'] ||
      'route_length' in doc && doc['route_length'] ||
      doc['durations'] ||
      'difficulties_height' in doc && doc['difficulties_height'] ||
      'mtb_length_asphalt' in doc && doc['mtb_length_asphalt'] ||
      'mtb_length_trail' in doc && doc['mtb_length_trail'] ||
      'mtb_height_diff_portages' in doc && doc['mtb_height_diff_portages'] ||
      'slackline_type' in doc && doc['slackline_type'] ||
      'slackline_height' in doc && doc['slackline_height']) {
    score_figures = 1;
  }
  let score_ratings = 0;
  if ('ski_rating' in doc && doc['ski_rating'] ||
      'ski_exposition' in doc && doc['ski_exposition'] ||
      'labande_ski_rating' in doc && doc['labande_ski_rating'] ||
      'labande_global_rating' in doc && doc['labande_global_rating'] ||
      'global_rating' in doc && doc['global_rating'] ||
      'engagement_rating' in doc && doc['engagement_rating'] ||
      'risk_rating' in doc && doc['risk_rating'] ||
      'equipment_rating' in doc && doc['equipment_rating'] ||
      'ice_rating' in doc && doc['ice_rating'] ||
      'mixed_rating' in doc && doc['mixed_rating'] ||
      'global_rating' in doc && doc['global_rating'] ||
      'engagement_rating' in doc && doc['engagement_rating'] ||
      'risk_rating' in doc && doc['risk_rating'] ||
      'equipment_rating' in doc && doc['equipment_rating'] ||
      'exposition_rock_rating' in doc && doc['exposition_rock_rating'] ||
      'rock_free_rating' in doc && doc['rock_free_rating'] ||
      'rock_required_rating' in doc && doc['rock_required_rating'] ||
      'aid_rating' in doc && doc['aid_rating'] ||
      'hiking_rating' in doc && doc['hiking_rating'] ||
      'hiking_mtb_exposition' in doc && doc['hiking_mtb_exposition'] ||
      'snowshoe_rating' in doc && doc['snowshoe_rating'] ||
      'mtb_down_rating' in doc && doc['mtb_down_rating'] ||
      'mtb_up_rating' in doc && doc['mtb_up_rating'] ||
      'hiking_mtb_exposition' in doc && doc['hiking_mtb_exposition'] ||
      'via_ferrata_rating' in doc && doc['via_ferrata_rating'] ||
      'engagement_rating' in doc && doc['engagement_rating'] ||
      'equipment_rating' in doc && doc['equipment_rating']) {
    score_ratings = 1;
  }

  let no_description = 1;
  if ('description' in doc.locales[0] && doc.locales[0]['description']) {
    score += 0.75;

    const pattern_title = /(^|\n)##/g; // regex for title
    const result_search_title = doc['locales'][0]['description'].search(pattern_title);
    const pattern_img = /\[img=/g; // regex for image
    const result_search_img = doc['locales'][0]['description'].search(pattern_img);
    if (result_search_title !== -1 || result_search_img !== -1) {
      score += 0.5;
    }
    no_description = 0;
  }

  if (activities.indexOf('rock_climbing') > -1 ||
      activities.indexOf('mountain_climbing') > -1 ||
      activities.indexOf('snow_ice_mixed') > -1) {
    if ('external_resources' in doc.locales[0] && doc.locales[0]['external_resources']) {
      score += 0.25;
    }
    if ('route_history' in doc.locales[0] && doc.locales[0]['route_history']) {
      score += 0.5;
    }
    if ('external_resources' in doc.locales[0] && doc.locales[0]['external_resources']) {
      score += 0.25;
    }

    score_climb = score + score_geometry * 0.75 + score_configuration * 0.25
                  + score_figures * 0.5 + score_wp * 0.25 + score_ratings * 0.75;
  } else {
    score_other_activities = score + score_geometry + score_configuration * 0.5
                             + score_figures * 0.5 + score_wp * 0.5 + score_ratings * 0.75;
  }

  score = Math.max(score_climb, score_other_activities);
  score = Math.floor(score);
  if (no_description == 1) {
    score = Math.min(score, 1);
  } else {
    score = Math.min(score, 4);
  }
  return score;
};

app.module.controller('appRouteEditingController', app.RouteEditingController);
