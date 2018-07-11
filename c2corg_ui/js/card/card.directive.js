import angular from 'angular';
import areasTemplate from './areas.html';
import articlesTemplate from './articles.html';
import booksTemplate from './books.html';
import imagesTemplate from './images.html';
import feedsTemplate from './feeds.html';
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
  'feeds': feedsTemplate,
  'outings': outingsTemplate,
  'routes': routesTemplate,
  'users': usersTemplate,
  'waypoints': waypointsTemplate,
  'xreports': xreportsTemplate
};

/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const CardDirective = ($compile, UtilsService) => {
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
    controller: 'CardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '<c2cCardDoc'
    },
    link(scope, element, attrs, ctrl) {
      getCardElement(ctrl.type)(scope, clone => {
        element.append(clone);
      });
    }
  };
};

export default CardDirective;
