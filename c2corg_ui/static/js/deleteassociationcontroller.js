goog.provide('app.DeleteAssociationController');

goog.require('app');

/**
 * @constructor
 * @param {angular.Scope} $rootScope
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap
 * @param {app.Api} appApi The API service
 * @param {app.Document} appDocument service
 * @ngInject
 * @struct
 */
app.DeleteAssociationController = function($rootScope, $scope, $compile,
  $uibModal, appApi, appDocument) {

  /**
   * @type {angular.$compile}
   * @private
   */
  this.compile_ = $compile;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {ui.bootstrap.$modal} angular bootstrap modal
   * @private
   */
  this.modal_ = $uibModal;

  /**
   * @type {angular.Scope}
   * @private
   */
  this.rootscope_ = $rootScope;

  /**
   * @type {app.Api} The API service
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Document}
   * @private
   */
  this.documentService_ = appDocument;

  /**
   * @type {number}
   * @export
   */
  this.parentId;

  /**
   * @type {string}
   * @export
   */
  this.childDoctype;

  /**
   * @type {number}
   * @export
   */
  this.childId;
};


/**
 * @return {ui.bootstrap.modalInstance}
 * @private
 */
app.DeleteAssociationController.prototype.openModal_ = function() {
  const template = $('#delete-association-modal').clone();
  return this.modal_.open({
    animation: true,
    size: 'sm',
    template: this.compile_(template)(this.scope_),
    controller: 'AppDeleteAssociationModalController',
    controllerAs: 'delModalCtrl'
  });
};

/**
 * Unassociate the document and remove the card.
 * @param {goog.events.Event | jQuery.Event} [event]
 * @private
 */
app.DeleteAssociationController.prototype.unassociateDocument_ = function(event) {
  this.api_.unassociateDocument(this.parentId, this.childId).then(() => {
    this.documentService_.removeAssociation(this.childId, this.childDoctype, event);
  });
};


app.module.controller('AppDeleteAssociationController', app.DeleteAssociationController);
