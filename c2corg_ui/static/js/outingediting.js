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
 * @export
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

  // allow association only for a new outing to existing route
  if (ngeoLocation.hasFragmentParam('r')) {
    var urlParam = {'routes': ngeoLocation.getFragmentParam('r')};
    appApi.getDocumentByIdAndDoctype(urlParam['routes'], 'r', appLang.getLang()).then(function(doc) {
      this.documentService.pushToAssociations(doc.data['routes'].documents[0], 'routes', true);
    }.bind(this));
  }

  if (this.auth.isAuthenticated()) {
    this.scope[this.modelName]['associations']['users'].push({
      'document_id': this.auth.userData.id,
      'name': this.auth.userData.name
    });
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
  if (this.auth.hasEditRights(outing['associations']['users'], null)) {
    outing = this.formatOuting_(outing);
    this.differentDates = window.moment(outing['date_start']).diff(outing['date_end']) !== 0;
    if (!this.differentDates) {
      outing['date_end'] = undefined;
    }
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
  // adapt the Object for what's expected on the API side + format the outing
  this.formatOuting_(/** @type appx.Outing */ (data));
  return data;
};


/**
 * @param {Object} outing
 * better edit-form checking before saving
 * @private
 */
app.DocumentEditingController.prototype.formatOuting_ = function(outing) {
  if (this.submit) {
    // transform condition_levels to a string
    if (typeof outing.locales[0]['conditions_levels'] !== 'string') {
      outing.locales[0]['conditions_levels'] = JSON.stringify(outing['locales'][0]['conditions_levels']);
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
      // init empty conditions_levels for ng-repeat
      outing['locales'][0]['conditions_levels'] = [{
        'level_snow_height_soft': '',
        'level_snow_height_total': '',
        'level_comment': '',
        'level_place': ''
      }];
    }
  }

  this.submit = false;
  return outing;
};


app.module.controller('appOutingEditingController', app.OutingEditingController);
