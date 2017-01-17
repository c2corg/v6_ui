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
        $uibModal, $compile, appLang, appAuthentication, ngeoLocation,
        appAlerts, appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
          appLang, appAuthentication, ngeoLocation, appAlerts, appApi,
          authUrl, appDocument, appUrl, imageUrl);

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
      'name': this.auth.userData.name
    });
  }

};

goog.inherits(app.XreportEditingController, app.DocumentEditingController);

app.module.controller('appXreportEditingController', app.XreportEditingController);
