/**
 * @module app.advancedSearchDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display the advanced search form and results.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppAdvancedSearchController',
    controllerAs: 'searchCtrl',
    bindToController: {
      'doctype': '@documentType',
      'useMap': '='
    },
    scope: true,
    templateUrl: '/static/partials/advancedsearch.html'
  };
};

appBase.module.directive('appAdvancedSearch', exports);


export default exports;
