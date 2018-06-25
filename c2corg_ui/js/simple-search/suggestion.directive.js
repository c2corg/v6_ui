import angular from 'angular';

/**
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$sce} $sce Angular Strict Contextual Escaping service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
const SuggestionDirective = ($compile, $sce, $templateCache, UtilsService) => {
  'ngInject';
  const cardElementCache = {};

  const getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    const path = '/static/partials/suggestions/' + doctype + '.html';
    const template = UtilsService.getTemplate(path, $templateCache);

    const element = angular.element(template);
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

      const document = scope.$parent['doc'];
      angular.extend(scope, document);

      if (document['activities']) {
        const activities = document['activities'];
        let activitiesHtml = '';
        for (let i = 0; i < activities.length; i++) {
          activitiesHtml += '<span class="icon-' + activities[i] + '"></span>';
        }
        scope.$parent['activitiesHtml'] = $sce.trustAsHtml(activitiesHtml);
      }

      const cardElementFn = getCardElement(document['documentType']);
      cardElementFn(scope, (clone) => {
        element.append(clone);
      });
      scope.$apply();
    }
  };
};

export default SuggestionDirective;
