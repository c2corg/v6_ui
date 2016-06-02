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

  var template = function(dataset) {
    return '<app-simple-search app-select="addCtrl.associate(doc)" dataset="' +
      dataset + '"></app-simple-search>';
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
  var parentId, childId;

  // if the parent doc is a route and the child doc is a waypoint OR
  // if the parent doc is an outing, inverse the IDs.
  if ((this.parentDoctype === 'routes' && doc['type'] === 'w') ||
      this.parentDoctype === 'outings') {
    childId = this.parentId;
    parentId = doc['document_id'];
  } else {
    childId = doc['document_id'];
    parentId = this.parentId;
  }

  this.api_.associateDocument(parentId, childId).then(function() {
    if (this.parentDoctype === 'waypoints' && doc['type'] === 'w') {
      // associating a waypoint to a waypoint
      this.documentService_.pushToAssociations(doc, 'waypoint_children');
    } else if (this.parentDoctype === 'waypoints' && doc['type'] === 'r') {
      // associating a route to a waypoint
      this.documentService_.pushToAssociations(doc, 'all_routes');
    } else {
      this.documentService_.pushToAssociations(doc);
    }
  }.bind(this));
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
