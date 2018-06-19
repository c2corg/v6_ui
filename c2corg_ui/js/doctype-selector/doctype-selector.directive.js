import template from './doctype-selector.html';

/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const DoctypeSelectorDirective = () => {
  return {
    restrict: 'E',
    bindToController: {
      'defaultType': '@c2cDoctype'
    },
    controller: 'DoctypeSelectorController',
    controllerAs: 'doctypeCtrl',
    template
  };
};

export default DoctypeSelectorDirective;
