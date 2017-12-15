goog.provide('app.RevertDocumentController');
goog.provide('app.revertDocumentDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.revertDocumentDirective = function() {
  return {
    restrict: 'A',
    controller: 'appRevertDocumentController',
    controllerAs: 'revertCtrl'
  };
};
app.module.directive('appRevertDocument', app.revertDocumentDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi appApi.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @ngInject
 */
app.RevertDocumentController = function(
  appAuthentication, appApi, appAlerts, gettextCatalog) {

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {app.Api}
   * @private
   */
  this.appApi_ = appApi;

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
};


/**
 * @param {number} documentId
 * @param {string} lang
 * @param {number} versionId
 * @export
 */
app.RevertDocumentController.prototype.revert = function(
  documentId, lang, versionId) {
  var catalog = this.gettextCatalog_;
  var gettext = function(str) {
    return catalog.getString(str);
  };
  if (this.auth_.isModerator() && window.confirm(gettext(
    'Are you sure you want to revert to this version of the document?'
  ))) {
    this.appApi_.revertDocument(documentId, lang, versionId).then(
      function(response) {
        this.appAlerts_.addSuccess(gettext('Revert succeeded'));
      }.bind(this)
    );
  }
};

app.module.controller('appRevertDocumentController', app.RevertDocumentController);
