goog.provide('app.AddAssociationController');
goog.provide('app.addAssociationDirective');

goog.require('app.Api');
/** @suppress {extraRequire} */
goog.require('app.simpleSearchDirective');
goog.require('app.utils');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.addAssociationDirective = function($compile) {

  var template = function(dataset) {
    return '<app-simple-search app-select="addCtrl.associate(doc)" dataset="' + dataset + '"></app-simple-search>';
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
 * @param {appx.DocumentData} documentData Some document data.
 * @constructor
 * @struct
 * @ngInject
 * @struct
 */
app.AddAssociationController = function(appApi, documentData) {

  /**
   * @type {app.Api} appApi The API service
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {appx.DocumentData}
   * @private
   */
  this.document_ = documentData;

  /**
   * @type {number}
   * @export
   */
  this.parentId;

  /**
   * Typed directly in the directive HTML.
   * It is the currently viewed document type.
   *
   * For example, if you are looking at a waypoint (waypoint details-view page) ->
   * parentType = waypoint, parentID = waypoint's_id.
   *
   * The child type and ID will depend on the document selected
   * in the results of the app-search dropdown.
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
      this.document_.associations.waypoint_children.push(doc);
    } else if (this.parentDoctype === 'waypoints' && doc['type'] === 'r') {
      // associating a route to a waypoint
      this.document_.associations.all_routes.total++;
      this.document_.associations.all_routes.routes.push(doc);
    } else {
      var doctype = app.utils.getDoctype(doc['type']);
      this.document_.associations[doctype].push(doc);
    }
  }.bind(this));
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
