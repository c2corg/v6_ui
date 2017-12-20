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
  let cardElementCache = {};

  let getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    let path = '/static/partials/suggestions/' + doctype + '.html';
    let template = app.utils.getTemplate(path, $templateCache);

    let element = angular.element(template);
    cardElementCache[doctype] = $compile(element);

    return cardElementCache[doctype];
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

      let document = scope.$parent['doc'];
      angular.extend(scope, document);

      if (document['activities']) {
        let activities = document['activities'];
        let activitiesHtml = '';
        for (let i = 0; i < activities.length; i++) {
          activitiesHtml += '<span class="icon-' + activities[i] + '"></span>';
        }
        scope.$parent['activitiesHtml'] = $sce.trustAsHtml(activitiesHtml);
      }

      let cardElementFn = getCardElement(document['documentType']);
      cardElementFn(scope, (clone) => {
        element.append(clone);
      });
      scope.$apply();
    }
  };
};

app.module.directive('appSuggestion', app.suggestionDirective);
