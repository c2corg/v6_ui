goog.provide('app.WaypointEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Document');


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
 * @constructor
 * @extends {app.DocumentEditingController}
 * @ngInject
 */
app.WaypointEditingController = function($scope, $element, $attrs, $http,
  $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
  appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

};

goog.inherits(app.WaypointEditingController, app.DocumentEditingController);


/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.WaypointEditingController.prototype.presetQuality = function(doc) {
  let score = 0;
  const wp_type = doc['waypoint_type'];
  let score_figures = 0;
  let score_description = 0;

  if ('summary' in doc.locales[0] && doc.locales[0]['summary']) {
    score_description++;
  }

  if ('description' in doc.locales[0] && doc.locales[0]['description']) {
    score_description++;

    const pattern_title = /(^|\n)##/g; // regex for title
    const result_search_title = doc['locales'][0]['description'].search(pattern_title);
    const pattern_img = /\[img=/g; // regex for image
    const result_search_img = doc['locales'][0]['description'].search(pattern_img);
    if (result_search_title !== -1) {
      score_description++;
    }
    if (result_search_img !== -1) {
      score_description++;
    }
  }

  switch (wp_type) {
    case 'climbing_outdoor':

      if ('access' in doc.locales[0] && doc.locales[0]['access'] ||
          'access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures += 0.5;
      }
      if ('height_max' in doc && doc['height_max'] ||
          'height_min' in doc && doc['height_min'] ||
          'height_median' in doc && doc['height_median'] ||
          'routes_quantity' in doc && doc['routes_quantity']) {
        score_figures += 0.75;
      }
      if ('climbing_rating_max' in doc && doc['climbing_rating_max'] ||
          'climbing_rating_min' in doc && doc['climbing_rating_min'] ||
          'climbing_rating_median' in doc && doc['climbing_rating_median'] ||
          'equipment_ratings' in doc && doc['equipment_ratings']) {
        score_figures += 0.75;
      }
      if ('rain_proof' in doc && doc['rain_proof'] ||
          'children_proof' in doc && doc['children_proof'] ||
          'best_periods' in doc && doc['best_periods'] ||
          'url' in doc && doc['url'] ||
          'access_time' in doc && doc['access_time']) {
        score_figures += 0.5;
      }
      if ('climbing_outdoor_types' in doc && doc['climbing_outdoor_types'] ||
          'rock_types' in doc && doc['rock_types'] ||
          'climbing_styles' in doc && doc['climbing_styles'] ||
          'orientations' in doc && doc['orientations']) {
        score_figures += 0.5;
      }
      break;
    case 'climbing_indoor':

      if ('access' in doc.locales[0] && doc.locales[0]['access']) {
        score_figures++;
      }
      if ('height_max' in doc && doc['height_max'] ||
          'height_min' in doc && doc['height_min'] ||
          'height_median' in doc && doc['height_median'] ||
          'routes_quantity' in doc && doc['routes_quantity'] ||
          'climbing_rating_max' in doc && doc['climbing_rating_max'] ||
          'climbing_rating_min' in doc && doc['climbing_rating_min'] ||
          'climbing_rating_median' in doc && doc['climbing_rating_median']) {
        score_figures++;
      }
      if ('climbing_indoor_types' in doc && doc['climbing_indoor_types'] ||
          'url' in doc && doc['url'] ||
          'climbing_styles' in doc && doc['climbing_styles'] ||
          'phone' in doc && doc['phone']) {
        score_figures++;
      }
      break;
    case 'gite' :

      if ('access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures++;
      }
      if ('capacity' in doc && doc['capacity'] ||
          'capacity_staffed' in doc && doc['capacity_staffed']) {
        score_figures++;
      }
      if ('url' in doc && doc['url'] ||
          'phone_custodian' in doc && doc['phone_custodian'] ||
          'phone' in doc && doc['phone']) {
        score_figures++;
      }
      break;
    case 'camp_site':

      if ('access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures++;
      }
      if ('capacity' in doc && doc['capacity'] ||
          'capacity_staffed' in doc && doc['capacity_staffed']) {
        score_figures++;
      }
      if ('url' in doc && doc['url'] ||
          'phone_custodian' in doc && doc['phone_custodian'] ||
          'phone' in doc && doc['phone']) {
        score_figures++;
      }
      break;
    case 'hut':

      if ('access' in doc.locales[0] && doc.locales[0]['access'] ||
          'access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures++;
      }
      if ('capacity' in doc && doc['capacity'] ||
          'capacity_staffed' in doc && doc['capacity_staffed']) {
        score_figures += 0.5;
      }
      if ('url' in doc && doc['url'] ||
          'phone_custodian' in doc && doc['phone_custodian'] ||
          'phone' in doc && doc['phone']) {
        score_figures += 0.5;
      }
      if ('matress_unstaffed' in doc && doc['matress_unstaffed'] ||
          'blanket_unstaffed' in doc && doc['blanket_unstaffed'] ||
          'gas_unstaffed' in doc && doc['gas_unstaffed'] ||
          'heating_unstaffed' in doc && doc['heating_unstaffed']) {
        score_figures++;
      }
      break;
    case 'shelter':

      if ('capacity' in doc && doc['capacity']) {
        score_figures++;
      }
      if ('matress_unstaffed' in doc && doc['matress_unstaffed'] ||
          'blanket_unstaffed' in doc && doc['blanket_unstaffed'] ||
          'gas_unstaffed' in doc && doc['gas_unstaffed'] ||
          'heating_unstaffed' in doc && doc['heating_unstaffed']) {
        score_figures += 2;
      }
      break;
    case 'bivouac':

      if ('capacity' in doc && doc['capacity']) {
        score_figures += 3;
      }
      break;
    case 'access':

      if ('public_transportation_rating' in doc && doc['public_transportation_rating'] ||
          'snow_clearance_rating' in doc && doc['snow_clearance_rating'] ||
          'lift_access' in doc && doc['lift_access'] ||
          'parking_fee' in doc && doc['parking_fee']) {
        score_figures += 2;
      }
      if ('access' in doc.locales[0] && doc.locales[0]['access'] ||
          'access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures++;
      }
      break;
    case 'local_product':

      if ('access' in doc.locales[0] && doc.locales[0]['access'] ||
          'access_period' in doc.locales[0] && doc.locales[0]['access_period']) {
        score_figures += 2;
      }
      if ('url' in doc && doc['url'] ||
          'phone' in doc && doc['phone']) {
        score_figures++;
      }
      break;
    case 'paragliding_takeoff' :

      if ('ground_types' in doc && doc['ground_types'] ||
          'orientations' in doc && doc['orientations']) {
        score_figures++;
      }
      if ('length' in doc && doc['length'] ||
          'slope' in doc && doc['slope']) {
        score_figures++;
      }
      if ('paragliding_rating' in doc && doc['paragliding_rating'] ||
          'exposition_rating' in doc && doc['exposition_rating']) {
        score_figures++;
      }
      break;
    case 'paragliding_landing':

      if ('ground_types' in doc && doc['ground_types'] ||
          'orientations' in doc && doc['orientations']) {
        score_figures++;
      }
      if ('length' in doc && doc['length'] ||
          'slope' in doc && doc['slope']) {
        score_figures++;
      }
      if ('paragliding_rating' in doc && doc['paragliding_rating'] ||
          'exposition_rating' in doc && doc['exposition_rating']) {
        score_figures++;
      }
      break;
    case 'slackline_spot':

      if ('access' in doc.locales[0] && doc.locales[0]['access'] ||
          'slackline_types' in doc && doc['slackline_types'] ||
          'access_time' in doc && doc['access_time'] ||
          'best_periods' in doc && doc['best_periods'] ||
          'orientations' in doc && doc['orientations']) {
        score_figures++;
      }
      if ('slackline_length_min' in doc && doc['slackline_length_min'] ||
          'slackline_length_max' in doc && doc['slackline_length_max']) {
        score_figures += 2;
      }
      break;
    default:
      score_figures = 0;
  }

  if (wp_type == 'virtual' || wp_type == 'summit' || wp_type == 'pass' || wp_type == 'lake' || wp_type == 'bisse' ||
      wp_type == 'waterfall' || wp_type == 'cave' || wp_type == 'locality' || wp_type == 'waterpoint' ||
      wp_type == 'canyon' || wp_type == 'misc' || wp_type == 'weather_station' || wp_type == 'webcam') {
    score = score_description;
  } else {
    score_figures = Math.floor(score_figures);
    score = Math.min(score_description, 1) + Math.min(score_figures, 3);
  }

  return score;
};

app.module.controller('appWaypointEditingController', app.WaypointEditingController);
