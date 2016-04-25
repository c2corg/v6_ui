goog.provide('app.DeleteAssociationController');
goog.provide('app.deleteAssociationDirective');

goog.require('app.Api');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.deleteAssociationDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppDeleteAssociationController as ctrl',
    bindToController: {
      'parentId': '=',
      'childId': '=',
      'addedDocuments': '='
    },
    link: function(scope, element, attrs, controller) {
      $(element).on('click', function() {
        controller.unassociateDocument_(element[0]);
      });
    },
    template: '<span class="glyphicon glyphicon-trash"></span>'
  };
};

app.module.directive('appDeleteAssociation', app.deleteAssociationDirective);


/**
 * @constructor
 * @param {app.Api} appApi The API service
 * @param {angular.Scope} $rootScope
 * @ngInject
 */
app.DeleteAssociationController = function(appApi, $attrs, $rootScope) {


  /**
   * @type {angular.Scope}
   * @private
   */
  this.rootscope_ = $rootScope;


  /**
   * Bound from directive.
   * @type {number}
   * @export
   */
  this.parentId;


  /**
   * @type {string}
   * @private
   */
  this.childDocType_ = $attrs['childDocType'];


  /**
   * Bound from directive.
   * @type {number}
   * @export
   */
  this.childId;


  /**
   * Bound from directive.
   * @type {Array.<appx.SimpleSearchDocument>}
   * @export
   */
  this.addedDocuments;


 /**
  * @type {app.Api} The API service
   * @private
   */
  this.api_ = appApi;

};


/**
 * Unassociate the document and remove the card, either by splicing the array
 * of added documents (Angular) or removing the closest element with "card"
 * class (Mako).
 * @param {Node} element Card element to be removed on click
 * @private
 */
app.DeleteAssociationController.prototype.unassociateDocument_ = function(element) {
  var added = this.addedDocuments;
  this.api_.unassociateDocument(this.parentId, this.childId).then(function() {
    this.rootscope_.$broadcast('unassociateDoc', {'id': this.childId, 'type': this.childDocType_});
    if (added) {
      // Remove the document from the array of Angular-added documents.
      for (var i = 0; i < added.length; ++i) {
        var current = added[i];
        if (current.document_id === this.childId) {
          added.splice(i, 1);
          return;
        }
      }
    } else {
      // Remove the Mako card.
      while (element) {
        if ($(element).hasClass('list-item')) {
          element.parentNode.removeChild(element);
          break;
        }
        element = element.parentNode;
      }
    }
  }.bind(this));
};


app.module.controller('AppDeleteAssociationController', app.DeleteAssociationController);
