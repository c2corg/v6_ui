/**
 * @module app.RevertDocumentController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi appApi.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @ngInject
 */
const exports = function(
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
exports.prototype.revert = function(
  documentId, lang, versionId) {
  const catalog = this.gettextCatalog_;
  const gettext = function(str) {
    return catalog.getString(str);
  };
  if (this.auth_.isModerator() && window.confirm(gettext(
    'Are you sure you want to revert to this version of the document?'
  ))) {
    this.appApi_.revertDocument(documentId, lang, versionId).then(
      (response) => {
        this.appAlerts_.addSuccess(gettext('Revert succeeded'));
      }
    );
  }
};

appBase.module.controller('appRevertDocumentController', exports);


export default exports;
