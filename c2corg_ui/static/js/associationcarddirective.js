goog.provide('app.associationCardDirective');

goog.require('app.utils');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.associationCardDirective = function() {
  var url = app.utils.buildDocumentUrl('{{::doc.documentType}}', '{{::doc.document_id}}', '{{::doc.locales[0].lang}}');
  return {
    restrict: 'E',
    scope: {
      'parentId': '=',
      'doc': '=',
      'addedDocuments': '='
    },
    template: '<a ng-href="' + url + '">{{::doc.locales[0].title}}</a> <app-delete-association parent-id="::parentId" child-id="::doc.document_id" added-documents="addedDocuments"></app-delete-association>'
  };
};

app.module.directive('appAssociationCard', app.associationCardDirective);
