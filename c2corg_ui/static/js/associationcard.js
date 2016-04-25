goog.provide('app.associationCardDirective');

goog.require('app.utils');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.associationCardDirective = function($compile, $templateCache) {
  // You should take the example from templates/{documentType}/card.html
  var template = function(doctype) {
    return $templateCache.get('/static/partials/card' + doctype + '.html');
  }
  return {
    restrict: 'E',
    scope: {
      'parentId': '=',
      'doc': '=',
      'addedDocuments': '='
    },
    link: function(scope, element, attrs, ctrl) {
      var doc = scope['doc'];
      scope['url'] =  app.utils.buildDocumentUrl(doc['documentType'], doc['document_id'], doc['locales'][0]['lang']);
      element.html(template(doc['documentType']));
      $compile(element.contents())(scope);
    }
  };
};

app.module.directive('appAssociationCard', app.associationCardDirective);
