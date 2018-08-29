goog.provide('app.BookEditingController');

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
app.BookEditingController = function($scope, $element, $attrs, $http,
  $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
  appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

};

goog.inherits(app.BookEditingController, app.DocumentEditingController);


/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.BookEditingController.prototype.presetQuality = function(doc) {
  let score = 0;

  if ('description' in doc.locales[0] && doc.locales[0]['description']) {
    score++;
  }
  if ('author' in doc && doc['author']) {
    score++;
  }
  if (doc['associations']['images'].length) {
    score++;
  }
  if ('url' in doc && doc['url']) {
    score += 0.5;
  }
  if ('langs' in doc && doc['langs']) {
    score += 0.25;
  }
  if ('publication_date' in doc && doc['publication_date']) {
    score += 0.25;
  }
  if ('isbn' in doc && doc['isbn']) {
    score += 0.25;
  }
  if ('nb_pages' in doc && doc['nb_pages']) {
    score += 0.25;
  }

  score = Math.floor(score);
  return score;
};

app.module.controller('appBookEditingController', app.BookEditingController);
