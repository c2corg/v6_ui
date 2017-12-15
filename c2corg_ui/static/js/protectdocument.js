goog.provide('app.protectDocumentDirective');
goog.provide('app.ProtectDocumentController');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Api');
goog.require('app.Authentication');


/**
 * @return {angular.Directive} The directive specs.
 */
app.protectDocumentDirective = function() {
  return {
    restrict: 'A',
    controller: 'appProtectDocumentController',
    controllerAs: 'protectCtrl',
    templateUrl: '/static/partials/protectdocument.html'
  };
};
app.module.directive('appProtectDocument', app.protectDocumentDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @constructor
 * @ngInject
 * @struct
 */
app.ProtectDocumentController = function(appAuthentication, appApi,
  appAlerts, gettextCatalog, documentData) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.appAlerts_ = appAlerts;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {appx.Document}
   * @export
   */
  this.documentData = documentData;
};


/**
 * @export
 */
app.ProtectDocumentController.prototype.protect = function() {
  if (this.auth_.isModerator()) {
    this.api_.protectDocument(this.documentData.document_id).then(function(response) {
      this.documentData['protected'] = true;
      this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
        'Document is now protected'
      ));
    }.bind(this));
  }
};


/**
 * @export
 */
app.ProtectDocumentController.prototype.unprotect = function() {
  if (this.auth_.isModerator()) {
    this.api_.unprotectDocument(this.documentData.document_id).then(function(response) {
      this.documentData['protected'] = false;
      this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
        'Document is no longer protected'
      ));
    }.bind(this));
  }
};

app.module.controller('appProtectDocumentController', app.ProtectDocumentController);
