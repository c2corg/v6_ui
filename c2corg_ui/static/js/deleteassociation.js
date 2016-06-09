goog.provide('app.DeleteAssociationController');
goog.provide('app.DeleteAssociationModalController');
goog.provide('app.deleteAssociationDirective');

goog.require('app.Api');
goog.require('app.Document');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.deleteAssociationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteAssociationController',
    controllerAs: 'unassociateCtrl',
    bindToController: {
      'parentId': '=',
      'childId': '=',
      'childDoctype': '@'
    },
    link: function(scope, element, attrs, controller) {
      $(element).on('click', function(e) {
        var modal = controller.openModal_();
        modal.result.then(function(res) {
          if (res) {
            controller.unassociateDocument_(e);
          }
        });
      });
    },
    template: '<span class="glyphicon glyphicon-trash"></span>'
  };
};

app.module.directive('appDeleteAssociation', app.deleteAssociationDirective);


/**
 * @constructor
 * @param {angular.Scope} $rootScope
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {Object} $uibModal modal from angular bootstrap
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
   * @type {Object} angular bootstrap modal
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
 * @private
 */
app.DeleteAssociationController.prototype.openModal_ = function() {
  var template = $('#delete-association-modal').clone();
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
  this.api_.unassociateDocument(this.parentId, this.childId).then(function() {
    this.documentService_.removeAssociation(this.childId, this.childDoctype, event);
  }.bind(this));
};


app.module.controller('AppDeleteAssociationController', app.DeleteAssociationController);


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 */
app.DeleteAssociationModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
app.DeleteAssociationModalController.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


/**
 * @export
 */
app.DeleteAssociationModalController.prototype.dismiss = function() {
  this.modalInstance_.close();
};

app.module.controller('AppDeleteAssociationModalController', app.DeleteAssociationModalController);
