goog.provide('app.deleteDocumentDirective');
goog.provide('app.DeleteDocumentController');

goog.require('app');

/**
 * This directive is used to manage the dialog to delete a document.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.deleteDocumentDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteDocumentController',
    controllerAs: 'deldocCtrl',
    templateUrl: '/static/partials/deletedocument.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

app.module.directive('appDeleteDocument', app.deleteDocumentDirective);


/**
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {app.Api} appApi appApi.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
app.DeleteDocumentController = function(documentData, appApi, appAlerts, gettextCatalog, $uibModalStack) {

  /**
   * @type {appx.Document}
   * @export
   */
  this.documentData = documentData;

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
};


/**
 * @export
 */
app.DeleteDocumentController.prototype.deleteDocument = function() {
  this.appApi_.deleteDocument(this.documentData.document_id).then(
      function(response) {
        this.closeDialog();
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
            'Document successfully deleted'
        ));
      }.bind(this)
  );
};


/**
 * @export
 */
app.DeleteDocumentController.prototype.deleteLocale = function() {
  this.appApi_.deleteLocale(this.documentData.document_id, this.lang).then(
      function(response) {
        this.closeDialog();
        this.appAlerts_.addSuccess(this.gettextCatalog_.getString(
            'Locale successfully deleted'
        ));
      }.bind(this)
  );
};


/**
 * @export
 */
app.DeleteDocumentController.prototype.closeDialog = function() {
  this.$uibModalStack_.dismissAll();
};

app.module.controller('AppDeleteDocumentController', app.DeleteDocumentController);
