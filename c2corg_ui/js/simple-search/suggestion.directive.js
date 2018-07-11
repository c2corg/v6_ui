import angular from 'angular';

import areasTemplate from './areas.html';
import articlesTemplate from './articles.html';
import booksTemplate from './books.html';
import imagesTemplate from './images.html';
import outingsTemplate from './outings.html';
import routesTemplate from './routes.html';
import usersTemplate from './users.html';
import waypointsTemplate from './waypoints.html';
import xreportsTemplate from './xreports.html';

const templates = {
  'areas': areasTemplate,
  'articles': articlesTemplate,
  'books': booksTemplate,
  'images': imagesTemplate,
  'outings': outingsTemplate,
  'routes': routesTemplate,
  'users': usersTemplate,
  'waypoints': waypointsTemplate,
  'xreports': xreportsTemplate
};

/**
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$sce} $sce Angular Strict Contextual Escaping service.
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
const SuggestionDirective = ($compile, $sce) => {
  'ngInject';
  const cardElementCache = {};

  const getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    const template = templates[doctype];
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
