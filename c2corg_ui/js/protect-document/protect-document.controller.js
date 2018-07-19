/**
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @constructor
 * @ngInject
 * @struct
 */
export default class ProtectDocumentController {
  constructor(AuthenticationService, ApiService, AlertsService, gettextCatalog, documentData) {
    'ngInject';

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.authenticationService_ = AuthenticationService;

    /**
     * @type {app.Alerts}
     * @private
     */
    this.appAlerts_ = AlertsService;

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
  }


  /**
   * @export
   */
  protect() {
    if (this.authenticationService_.isModerator()) {
      this.apiService_.protectDocument(this.documentData.document_id).then((response) => {
        this.documentData['protected'] = true;
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
          'Document is now protected'
        ));
      });
    }
  }


  /**
   * @export
   */
  unprotect() {
    if (this.authenticationService_.isModerator()) {
      this.apiService_.unprotectDocument(this.documentData.document_id).then(response => {
        this.documentData['protected'] = false;
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString('Document is no longer protected'));
      });
    }
  }
}
