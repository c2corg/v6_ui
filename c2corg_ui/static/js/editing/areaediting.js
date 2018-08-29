goog.provide('app.AreaEditingController');

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
app.AreaEditingController = function($scope, $element, $attrs, $http,
  $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
  appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

};

goog.inherits(app.AreaEditingController, app.DocumentEditingController);


/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.AreaEditingController.prototype.presetQuality = function(doc) {
  let score = 0;

  if ('summary' in doc.locales[0] && doc.locales[0]['summary']) {
    score++;
  }

  if ('description' in doc.locales[0] && doc.locales[0]['description']) {
    score++;

    const pattern_title = /(^|\n)##/g; // regex for title
    const result_search_title = doc['locales'][0]['description'].search(pattern_title);
    const pattern_img = /\[img=/g; // regex for image
    const result_search_img = doc['locales'][0]['description'].search(pattern_img);
    if (result_search_title !== -1) {
      score++;
    }
    if (result_search_img !== -1) {
      score++;
    }
  }

  return score;
};

app.module.controller('appAreaEditingController', app.AreaEditingController);
