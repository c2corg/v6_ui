/**
 * @module app.doctypeSelectorDirective
 */
import appBase from './index.js';

/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    bindToController: {
      'defaultType': '@appDoctype'
    },
    controller: 'appDoctypeSelectorController',
    controllerAs: 'doctypeCtrl',
    templateUrl: '/static/partials/doctypeselector.html'
  };
};


appBase.module.directive('appDoctypeSelector', exports);


export default exports;
