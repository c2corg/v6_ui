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
    template: '<img class="del_light" />'
  };
};

app.module.directive('appDeleteAssociation', app.deleteAssociationDirective);


/**
 * @constructor
 * @param {app.Api} appApi The API service
 * @ngInject
 */
app.DeleteAssociationController = function(appApi) {
  /**
   * Bound from directive.
   * @type {number}
   * @export
   */
  this.parentId;

  /**
   * Bound from directive.
   * @type {number}
   * @export
   */
  this.childId;

  /**
   * Bound from directive.
   * @type {Array.<appx.SearchDocument>}
   * @export
   */
  this.addedDocuments;

 /**
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
  var childId = this.childId;

  this.api_.unassociateDocument(this.parentId, childId).then(function() {
    if (added) {
      // Remove the document from the array of Angular-added documents.
      for (var i = 0; i < added.length; ++i) {
        var current = added[i];
        if (current.document_id === childId) {
          added.splice(i, 1);
          break;
        }
      }
    } else {
      // Remove the Mako card.
      while (element) {
        if (element.className === 'card') {
          element.parentNode.removeChild(element);
          break;
        }
        element = element.parentNode;
      }
    }
  });
};


app.module.controller('AppDeleteAssociationController', app.DeleteAssociationController);
