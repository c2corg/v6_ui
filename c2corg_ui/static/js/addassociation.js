goog.provide('app.AddAssociationController');
goog.provide('app.addAssociationDirective');

goog.require('app.Api');
goog.require('app.Document');
/** @suppress {extraRequire} */
goog.require('app.simpleSearchDirective');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.addAssociationDirective = function($compile) {

  let template = function(dataset) {
    return '<app-simple-search app-select="addCtrl.associate(doc)" ' +
      'ignore-document-id="addCtrl.parentId" ' +
      'dataset="' + dataset + '"></app-simple-search>';
  };

  return {
    restrict: 'E',
    controller: 'AppAddAssociationController',
    controllerAs: 'addCtrl',
    bindToController: {
      'parentId': '=',
      'parentDoctype': '@'
    },
    link: function(scope, element, attrs) {
      element.html(template(attrs.dataset));
      $compile(element.contents())(scope);
    }
  };
};

app.module.directive('appAddAssociation', app.addAssociationDirective);


/**
 * @param {app.Api} appApi The API service
 * @param {app.Document} appDocument service
 * @constructor
 * @struct
 * @ngInject
 */
app.AddAssociationController = function(appApi, appDocument) {

  /**
   * @type {app.Api} appApi The API service
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
  this.parentDoctype;
};


/**
 * Associate two documents. Possible associations are listed under
 * https://github.com/c2corg/v6_common/blob/master/c2corg_common/associations.py#L15
 * For example, we cannot directly associate a waypoint to a route,
 * but a route to a waypoint is possible, so we have to do it the other way around
 * and change parent/child IDs accordingly. Same for outings.
 * @param {appx.SimpleSearchDocument} doc Document
 * @export
 */
app.AddAssociationController.prototype.associate = function(doc) {
  let parentId, childId;
  let parentType = this.parentDoctype;

  // if the parent doc is a route and the child doc is a waypoint OR
  // if the parent doc is an outing, inverse the IDs.
  if ((parentType === 'routes' && doc['type'] === 'w') ||
      (parentType === 'outings' && (doc['type'] === 'r' || doc['type'] === 'u')) ||
      parentType === 'images' ||
      (parentType === 'articles' && (doc['type'] === 'w' ||
       doc['type'] === 'o' || doc['type'] === 'r' || doc['type'] === 'b')) ||
      (parentType === 'routes' && doc['type'] === 'b') ||
      (parentType === 'waypoints' && doc['type'] === 'b') ||
      (parentType === 'xreports' && (doc['type'] === 'r' || doc['type'] === 'o' || doc['type'] === 'w')) ||
      (parentType === 'articles' && (doc['type'] === 'w' || doc['type'] === 'c' || doc['type'] === 'b'))) {
    childId = this.parentId;
    parentId = doc['document_id'];
  } else {
    childId = doc['document_id'];
    parentId = this.parentId;
  }

  this.api_.associateDocument(parentId, childId).then(() => {
    if (parentType === 'waypoints' && doc['type'] === 'w') {
      // associating a waypoint to a waypoint
      this.documentService_.pushToAssociations(doc, 'waypoint_children');
    } else {
      this.documentService_.pushToAssociations(doc);
    }
  });
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
