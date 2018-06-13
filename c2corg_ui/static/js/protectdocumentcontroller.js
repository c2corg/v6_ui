/**
 * @module app.ProtectDocumentController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} ApiService Api service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @constructor
 * @ngInject
 * @struct
 */
const exports = function(appAuthentication, ApiService, appAlerts, gettextCatalog, documentData) {

  /**
   * @type {app.Api}
   * @private
   */
  this.apiService_ = ApiService;

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
exports.prototype.protect = function() {
  if (this.auth_.isModerator()) {
    this.apiService_.protectDocument(this.documentData.document_id).then((response) => {
      this.documentData['protected'] = true;
      this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
        'Document is now protected'
      ));
    });
  }
};


/**
 * @export
 */
exports.prototype.unprotect = function() {
  if (this.auth_.isModerator()) {
    this.apiService_.unprotectDocument(this.documentData.document_id).then((response) => {
      this.documentData['protected'] = false;
      this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
        'Document is no longer protected'
      ));
    });
  }
};

appBase.module.controller('appProtectDocumentController', exports);


export default exports;
