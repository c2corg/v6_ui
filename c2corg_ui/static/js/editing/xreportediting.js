goog.provide('app.XreportEditingController');

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
app.XreportEditingController = function($scope, $element, $attrs, $http,
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

  if (this.auth.isAuthenticated()) {

    this.scope[this.modelName]['associations']['users'].push({
      'document_id': this.auth.userData.id,
      'name': this.auth.userData.name,
      'locales': [
        {
          'lang': this.auth.userData.lang
        }
      ]
    });
  }

};

goog.inherits(app.XreportEditingController, app.DocumentEditingController);


/**
 * @param {appx.Document} data
 * @return {appx.Document}
 * @override
 * @public
 */
app.XreportEditingController.prototype.filterData = function(data) {
  data['date'] = new Date(data['date']);
  return data;
};


/**
 * @param {appx.Document} data Document attributes.
 * @return {appx.Document}
 * @public
 */
app.XreportEditingController.prototype.prepareData = function(data) {
  if (data['anonymous']) {
    data['associations']['users'] = [];
  }
  return data;
};

/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.XreportEditingController.prototype.presetQuality = function(doc) {
  let score = 0;

  if (doc['rescue'] ||
      'nb_participants' in doc && doc['nb_participants'] ||
      'nb_impacted' in doc && doc['nb_impacted'] ||
      'severity' in doc && doc['severity'] ||
      'age' in doc && doc['age'] ||
      'gender' in doc && doc['gender'] ||
      'author_status' in doc && doc['author_status'] ||
      'activity_rate' in doc && doc['activity_rate'] ||
      'nb_outings' in doc && doc['nb_outings'] ||
      'previous_injuries' in doc && doc['previous_injuries']) {
    score = score + 0.75;
  }
  let no_description = 1;
  if ('description' in doc.locales[0] && doc.locales[0]['description'] ||
      'summary' in doc.locales[0] && doc.locales[0]['summary']) {
    score = score + 1;
    no_description = 0;
  }

  if ('place' in doc.locales[0] && doc.locales[0]['place'] ||
      'route_study' in doc.locales[0] && doc.locales[0]['route_study'] ||
      'conditions' in doc.locales[0] && doc.locales[0]['conditions'] ||
      'training' in doc.locales[0] && doc.locales[0]['training'] ||
      'motivations' in doc.locales[0] && doc.locales[0]['motivations']) {
    score = score + 0.75;
  }
  if ('group_management' in doc.locales[0] && doc.locales[0]['group_management'] ||
      'risk' in doc.locales[0] && doc.locales[0]['risk'] ||
      'time_management' in doc.locales[0] && doc.locales[0]['time_management'] ||
      'safety' in doc.locales[0] && doc.locales[0]['safety']) {
    score = score + 0.75;
  }

  if ('reduce_impact' in doc.locales[0] && doc.locales[0]['reduce_impact'] ||
      'modifications' in doc.locales[0] && doc.locales[0]['modifications'] ||
      'other_comments' in doc.locales[0] && doc.locales[0]['other_comments']) {
    score = score + 0.75;
  }

  score = Math.floor(score);
  if (no_description == 1) {
    score = Math.min(score, 1);
  } else {
    score = Math.min(score, 4);
  }
  return score;
};

app.module.controller('appXreportEditingController', app.XreportEditingController);
