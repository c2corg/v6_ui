/**
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {app.Api} ApiService api service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
export default class DeleteDocumentController {
  constructor(documentData, ApiService, appAlerts, gettextCatalog, $uibModalStack) {
    'ngInject';

    /**
     * @type {appx.Document}
     * @export
     */
    this.documentData = documentData;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

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
     * @type {ui.bootstrap.$modalStack}
     * @private
     */
    this.$uibModalStack_ = $uibModalStack;

    /**
     * @export
     * @type {string}
     */
    this.module;

    /**
     * @export
     * @type {string}
     */
    this.lang;
  }


  /**
   * @export
   */
  deleteDocument() {
    this.apiService_.deleteDocument(this.documentData.document_id).then(
      response => {
        this.closeDialog();
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
          'Document successfully deleted'
        ));
      }
    );
  }


  /**
   * @export
   */
  deleteLocale() {
    this.apiService_.deleteLocale(this.documentData.document_id, this.lang).then(
      (response) => {
        this.closeDialog();
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
          'Locale successfully deleted'
        ));
      }
    );
  }


  /**
   * @export
   */
  closeDialog() {
    this.$uibModalStack_.dismissAll();
  }
}
