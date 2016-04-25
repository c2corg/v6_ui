goog.provide('app.associationCardDirective');

goog.require('app.utils');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.associationCardDirective = function($compile) {
  var url = app.utils.buildDocumentUrl('{{::doc.documentType}}', '{{::doc.document_id}}', '{{::doc.locales[0].lang}}');

  // You should take the example from templates/{documentType}/card.html
  var template = function(doc) {
    // WP
    if (doc['waypoint_type']) {
      return '<a ng-href="' + url + '"> <span class="list-item-title">{{::doc.locales[0].title}}</span>' +
                  '<span class="list-item-info">' +
                    '<p><b  class="value-title" translate>elevation</b>: <span class="value">{{::doc.elevation}}m</span></p>' +
                        '<span class="waypoint-type icon-{{::doc.waypoint_type}}"></span>' +
                        '<span x-translate>{{::doc.waypoint_type}}</span>' +
                  '</span>' +
                 '</a>' +
                 '<app-delete-association parent-id="::parentId" child-id="::doc.document_id" added-documents="addedDocuments">' +
                 '</app-delete-association>';

    // Route
    } else if (doc['activities']) {
      return '<a ng-href="' + url + '"> <span class="list-item-title">{{::doc.locales[0].title}}</span>' +
                    '<div class="list-item-info">' +
                      '<p ng-if="doc.elevation_max"><b  class="value-title" translate>elevation</b>: <span class="value">{{::doc.elevation_max}}m</span></p>' +
                      '<div class="route-activities">' +
                        '<span ng-repeat="activity in doc.activities" class="route-activity icon-{{activity}}" uib-tooltip="{{ mainCtrl.translate(activity) }}" tooltip-placement="right"></span>' +
                      '</div>' +
                    '</div>' +
                  '</a>' +
                  '<app-delete-association parent-id="::parentId" child-id="::doc.document_id" added-documents="addedDocuments">' +
                  '</app-delete-association>';
    }
  }
  return {
    restrict: 'E',
    scope: {
      'parentId': '=',
      'doc': '=',
      'addedDocuments': '='
    },
    link: function(scope, element, attrs, ctrl) {
      element.html(template(scope['doc']));
      $compile(element.contents())(scope);
    }
  };
};

app.module.directive('appAssociationCard', app.associationCardDirective);
