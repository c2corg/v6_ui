goog.provide('app.cardDirective');

goog.require('app');
goog.require('app.utils');


/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cardDirective = function($compile, $templateCache) {
  const cardElementCache = {};

  const getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    const path = '/static/partials/cards/' + doctype + '.html';
    const template = app.utils.getTemplate(path, $templateCache);
    const element = angular.element(template);
    cardElementCache[doctype] = $compile(element);
    return cardElementCache[doctype];
  };

  return {
    restrict: 'E',
    controller: 'AppCardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '<appCardDoc'
    },
    link: function(scope, element, attrs, ctrl) {
      const cardElementFn = getCardElement(ctrl.type);
      cardElementFn(scope, (clone) => {
        element.append(clone);
      });
    }
  };
};
