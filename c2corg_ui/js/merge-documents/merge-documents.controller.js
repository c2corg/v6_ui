/**
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {app.Api} ApiService Api service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
export default class MergeDocumentsController {
  constructor(documentData, ApiService, appAlerts, gettextCatalog, $uibModalStack) {
    'ngInject';

    /**
     * @type {appx.Document}
     * @export
     */
    this.sourceDocument = documentData;

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
     * @type {appx.SimpleSearchDocument}
     */
    this.targetDocument;
  }

  /**
   * @export
   * @param {appx.SimpleSearchDocument} document
   */
  selectTargetDocument(document) {
    this.targetDocument = document;
  }

  /**
   * @export
   */
  mergeDocuments() {
    if (!this.targetDocument) {
      return;
    }

    const msg = this.gettextCatalog_.getString('Are you sure you want to merge?');
    if (window.confirm(msg)) {
      this.apiService_.mergeDocuments(
        this.sourceDocument.document_id, this.targetDocument.document_id)
        .then(
          (response) => {
            this.closeDialog();
            this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
              'Documents successfully merged'
            ));
          }
        );
    }
  }


  /**
   * @export
   */
  closeDialog() {
    this.$uibModalStack_.dismissAll();
  }


  /**
   * @export
   */
  getTargetTitle() {
    if (!this.targetDocument) {
      return null;
    }

    const locale = this.targetDocument.locales[0];
    let title = (locale.title_prefix) ? locale.title_prefix + ' : ' : '';
    title += locale.title;

    return title;
  }
}
