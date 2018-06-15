import angular from 'angular';

/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const CardDirective = ($compile, $templateCache, UtilsService) => {
  'ngInject';

  const cardElementCache = {};

  const getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    const path = '/static/partials/cards/' + doctype + '.html';
    const template = UtilsService.getTemplate(path, $templateCache);
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
      const cardElementFn = getCardElement(ctrl.type);
      cardElementFn(scope, (clone) => {
        element.append(clone);
      });
    }
  };
};

export default CardDirective;
