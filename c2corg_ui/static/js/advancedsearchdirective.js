goog.provide('app.advancedSearchDirective');

goog.require('app');


/**
 * This directive is used to display the advanced search form and results.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.advancedSearchDirective = function() {
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

app.module.directive('appAdvancedSearch', app.advancedSearchDirective);
