import template from './cotometer.html';

/**
 * This directive is used to manage the dialog of cotometer
 * cotometerRating function was developed and made available with the support of BLMS http://paleo.blms.free.fr
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const CotometerDirective = () => {
  return {
    restrict: 'E',
    controller: 'CotometerController',
    controllerAs: 'cotmetCtrl',
    template,
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

export default CotometerDirective;
