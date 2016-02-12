goog.provide('app.AddAssociationController');
goog.provide('app.addAssociationDirective');

/** @suppress {extraRequire} */
goog.require('app.searchDirective');
goog.require('app.Api');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.addAssociationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAddAssociationController',
    bindToController: {
      'parentId': '=',
      'addedDocuments': '='
    },
    controllerAs: 'addCtrl',
    template: '<app-search app-select="addCtrl.associate(doc)"></app-search>'
  };
};
       
app.module.directive('appAddAssociation', app.addAssociationDirective);


/**
 * @constructor
 * @param {app.Api} appApi The API service
 * @ngInject
 */
app.AddAssociationController = function(appApi) {
  /**
   * @type {number} // bound from directive
   * @export
   */
  this.parentId;

  /**
   * @private
   */
  this.appApi_ = appApi;

  /**
   * @type {Array.<appx.SearchDocument>}
   * @export
   */
  this.addedDocuments = [];
};


/**
 * @param {appx.SearchDocument} doc Document
 * @export
 */
app.AddAssociationController.prototype.associate = function(doc) {
  this.appApi_.postJson('/associations', {
    'parent_document_id': this.parentId,
    'child_document_id': doc.document_id
  }).then(function() {
    this.addedDocuments.push(doc);
  }.bind(this), function() {
    console.log('error associating', doc.document_id);
  });
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
