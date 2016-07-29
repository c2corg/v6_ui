goog.provide('app.suggestionDirective');

goog.require('app.utils');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$sce} $sce Angular Strict Contextual Escaping service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
app.suggestionDirective = function($compile, $sce, $templateCache) {
  var template = function(doctype) {
    var path = '/static/partials/suggestions/' + doctype + '.html';
    return app.utils.getTemplate(path, $templateCache);
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element) {
      scope.highlight = function(text, search) {
        if (search) { // i = case insensitive
          return $sce.trustAsHtml(text.replace(
            new RegExp(search, 'ig'),
            '<span class="tt-highlight">$&</span>'));
        }
        return $sce.trustAsHtml(text);
      };

      var document = scope.$parent['doc'];
      angular.extend(scope, document);

      if (document['activities']) {
        var activities = document['activities'];
        var activitiesHtml = '';
        for (var i = 0; i < activities.length; i++) {
          activitiesHtml += '<span class="icon-' + activities[i] + '"></span>';
        }
        scope.$parent['activitiesHtml'] = $sce.trustAsHtml(activitiesHtml);
      }

      element.html(template(document['documentType']));
      $compile(element.contents())(scope);
      scope.$apply();
    }
  };
};

app.module.directive('appSuggestion', app.suggestionDirective);
