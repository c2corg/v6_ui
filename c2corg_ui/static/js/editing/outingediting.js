goog.provide('app.OutingEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Alerts');
goog.require('app.Document');
goog.require('app.Lang');


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
app.OutingEditingController = function($scope, $element, $attrs, $http,
    $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
    appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

  /**
   * Start cannot be after today nor end_date.
   * @type {Date}
   * @export
   */
  this.dateMaxStart = new Date();

  /**
   * @type {Date}
   * @export
   */
  this.today = new Date();

  /**
   * The end date cannot be before start nor today.
   * @type {Date}
   * @export
   */
  this.dateMaxEnd = new Date();

  /**
   * The end date cannot be before start.
   * @type {Date}
   * @export
   */
  this.dateMinEnd;

  /**
   * @type {?boolean}
   * @export
   */
  this.differentDates;

  if (this.auth.isAuthenticated()) {
    // allow association only for a new outing to existing route
    if (ngeoLocation.hasFragmentParam('r')) {
      var routeId = parseInt(ngeoLocation.getFragmentParam('r'), 10);
      appApi.getDocumentByIdAndDoctype(routeId, 'r', appLang.getLang()).then(
        function(doc) {
          this.documentService.pushToAssociations(doc.data['routes'].documents[0],
                                                  'routes',
                                                  this.handleAssociation);
        }.bind(this)
      );
    }

    this.scope[this.modelName]['associations']['users'].push({
      'document_id': this.auth.userData.id,
      'name': this.auth.userData.name
    });
    if (!this.id) {
      this.initConditionsLevels_();
    }
  }
};
goog.inherits(app.OutingEditingController, app.DocumentEditingController);


/**
 * @param {Object} response Response from the API server.
 * @override
 * @public
 */
app.OutingEditingController.prototype.successRead = function(response) {
  goog.base(this, 'successRead', response);

  var outing = this.scope[this.modelName];
  // check if user has right to edit -> the user is one of the associated users
  var userIds = [];
  outing['associations']['users'].forEach(function(user) {
    userIds.push(user['document_id']);
  });
  if (this.auth.hasEditRights('outings', {'users': userIds})) {
    outing = this.formatOuting_(outing);
    this.differentDates = window.moment(outing['date_start']).diff(outing['date_end']) !== 0;
    if (!this.differentDates) {
      outing['date_end'] = undefined;
    }
    // Length attributes are stored in meters but shown in kilometers:
    outing['length_total'] /= 1000;
  } else {
    this.alerts.addError('You have no rights to edit this document.');
    setTimeout(function() { // redirect to the details-view page
      window.location = window.location.href.replace('/edit', '');
    }, 3000);
  }
};


/**
 * @param {appx.Document} data Document attributes.
 * @return {appx.Document}
 * @override
 * @public
 */
app.OutingEditingController.prototype.prepareData = function(data) {
  this.formatOuting_(/** @type appx.Outing */ (data), true);
  // Length attributes are stored in meters but shown in kilometers:
  data['length_total'] *= 1000;

  // filtering outing ratings on activities
  var activities = data['activities'];
  if (activities.indexOf('skitouring') === -1) {
    delete data['ski_rating'];
    delete data['labande_global_rating'];
  }
  if (activities.indexOf('snowshoeing') === -1) {
    delete data['snowshoe_rating'];
  }
  if (activities.indexOf('hiking') === -1) {
    delete data['hiking_rating'];
  }
  if (activities.indexOf('snow_ice_mixed') === -1 &&
      activities.indexOf('mountain_climbing') === -1 &&
      activities.indexOf('rock_climbing') === -1) {
    delete data['global_rating'];
  }
  if (activities.indexOf('snow_ice_mixed') === -1 &&
      activities.indexOf('mountain_climbing') === -1) {
    delete data['height_diff_difficulties'];
    delete data['engagement_rating'];
  }
  if (activities.indexOf('rock_climbing') === -1) {
    delete data['equipment_rating'];
    delete data['rock_free_rating'];
  }
  if (activities.indexOf('ice_climbing') === -1) {
    delete data['ice_rating'];
  }
  if (activities.indexOf('via_ferrata') === -1) {
    delete data['via_ferrata_rating'];
  }
  if (activities.indexOf('mountain_biking') === -1) {
    delete data['mtb_up_rating'];
    delete data['mtb_down_rating'];
  }

  return data;
};


/**
 * @param {appx.Outing} outing
 * @param {boolean=} submit
 * better edit-form checking before saving
 * @private
 */
app.OutingEditingController.prototype.formatOuting_ = function(outing, submit) {
  if (submit) {
    // transform condition_levels to a string
    if (typeof outing.locales[0]['conditions_levels'] !== 'string') {
      outing.locales[0]['conditions_levels'] =
        JSON.stringify(outing['locales'][0]['conditions_levels']);
    }
    if (outing.date_start instanceof Date) {
      outing.date_start = window.moment(outing.date_start).format('YYYY-MM-DD');
    }
    // if no date end -> make it the same as date start
    if (!outing.date_end && outing.date_start) {
      outing.date_end = outing.date_start;
    } else if (outing.date_end instanceof Date) {
      outing.date_end = window.moment(outing.date_end).format('YYYY-MM-DD');
    }

    // remove 'null' from the array, it's not accepted by the API
    if (outing.avalanche_signs && outing.avalanche_signs[0] === null) {
      if (outing.avalanche_signs.length === 1) {
        delete outing.avalanche_signs;
      } else {
        outing.avalanche_signs.splice(0, 1);
      }
    }
  } else {
    // convert existing date from string to a date object
    if (outing.date_end && typeof outing.date_end === 'string') {
      outing.date_end = window.moment(outing.date_end).toDate();
    }
    if (outing.date_start && typeof outing.date_start === 'string') {
      outing.date_start = window.moment(outing.date_start).toDate();
    }
    // if only date_start -> date_start = date_end
    if (outing.date_start.toDateString() === outing.date_end.toDateString()) {
      this.dateMaxStart = new Date();
    } else {
      this.dateMinEnd = outing.date_start;
      this.dateMaxStart = outing.date_end;
    }

    var conditions = outing.locales[0]['conditions_levels'];
    // conditions_levels -> to Object, snow_height -> to INT
    if (conditions && typeof conditions === 'string') {
      conditions = JSON.parse(conditions);
      this.scope[this.modelName]['locales'][0]['conditions_levels'] = conditions;
    } else {
      this.initConditionsLevels_();
    }
  }

  return outing;
};


/**
 * init empty conditions levels for ng-repeat
 * @private
 */
app.OutingEditingController.prototype.initConditionsLevels_ = function() {
  this.scope['outing']['locales'][0]['conditions_levels'] = [{
    'level_snow_height_soft': '',
    'level_snow_height_total': '',
    'level_comment': '',
    'level_place': ''
  }];
};


/**
 * @param {appx.Document} data
 * @param {appx.SimpleSearchDocument} doc
 * @param {string=} doctype Optional doctype
 * @return {appx.Document}
 * @export
 */
app.OutingEditingController.prototype.handleAssociation = function(data, doc,
    doctype) {
  doctype = doctype || app.utils.getDoctype(doc['type']);

  // When creating an outing, set the default title and ratings using
  // the first associated route data.
  if (!data.document_id && doctype === 'routes' &&
      data.associations.routes.length === 1) {
    var title = 'title_prefix' in doc.locales[0] &&
      doc.locales[0]['title_prefix'] ?
      doc.locales[0]['title_prefix'] + ' : ' : '';
    title += doc.locales[0]['title'];
    data.locales[0]['title'] = title;

    data['ski_rating'] = doc['ski_rating'];
    data['labande_global_rating'] = doc['labande_global_rating'];
    data['snowshoe_rating'] = doc['snowshoe_rating'];
    data['hiking_rating'] = doc['hiking_rating'];
    data['global_rating'] = doc['global_rating'];
    data['height_diff_difficulties'] = doc['height_diff_difficulties'];
    data['engagement_rating'] = doc['engagement_rating'];
    data['equipment_rating'] = doc['equipment_rating'];
    data['rock_free_rating'] = doc['rock_free_rating'];
    data['ice_rating'] = doc['ice_rating'];
    data['via_ferrata_rating'] = doc['via_ferrata_rating'];
    data['mtb_up_rating'] = doc['mtb_up_rating'];
    data['mtb_down_rating'] = doc['mtb_down_rating'];

    data['elevation_min'] = doc['elevation_min'];
    data['elevation_max'] = doc['elevation_max'];
    data['height_diff_up'] = doc['height_diff_up'];
    data['height_diff_down'] = doc['height_diff_down'];
  }

  return data;
};

app.module.controller('appOutingEditingController', app.OutingEditingController);
