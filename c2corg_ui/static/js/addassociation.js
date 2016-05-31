goog.provide('app.AddAssociationController');
goog.provide('app.addAssociationDirective');

/** @suppress {extraRequire} */
goog.require('app.simpleSearchDirective');
goog.require('app.Api');


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
    bindToController: {
      'parentId': '=',
      'addedDocuments': '='
    },
    controllerAs: 'addCtrl',
    link: function(scope, element, attrs, ctrl) {
      element.html(template(ctrl.dataset_));
      $compile(element.contents())(scope);
    }
  };
};

app.module.directive('appAddAssociation', app.addAssociationDirective);


/**
 * @constructor
 * @param {app.Api} appApi The API service
 * @ngInject
 * @struct
 */
app.AddAssociationController = function(appApi, $attrs) {

  /**
   * @type {number}
   * @export
   */
  this.parentId;

  /**
   * @type {app.Api} appApi The API service
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {string}
   * @private
   */
  this.dataset_ = $attrs['dataset'];

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
   * @private
   */
  this.parentDocType = $attrs['parentDocType'];

  /**
   * @type {Array.<appx.SimpleSearchDocument>}
   * @export
   */
  this.addedDocuments = [];
};


/**
 * Associate two documents. Possible associations are listed under https://github.com/c2corg/v6_common/blob/master/c2corg_common/associations.py#L15
 * For example, we cannot directly associate a waypoint to a route, but a route to a waypoint
 * is possible, so we have to do it the other way around and change parent/child IDs accordingly. Same for outings.
 * @param {appx.SimpleSearchDocument} doc Document
 * @export
 */
app.AddAssociationController.prototype.associate = function(doc) {
  var parentId, childId;
  // if the parentDoc is a Route and the childDoc is a Waypoint OR the parentDoc is an Outing, inverse the IDs.
  if ((this.parentDocType === 'routes' && doc['type'] === 'w') || this.parentDocType === 'outings') {
    childId = this.parentId;
    parentId = doc['document_id'];
  } else {
    childId = doc['document_id'];
    parentId = this.parentId;
  }
  this.api_.associateDocument(parentId, childId).then(function() {
    this.addedDocuments.push(doc);
  }.bind(this));
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
