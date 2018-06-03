goog.provide('app.doctypeSelectorDirective');

goog.require('app');


/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.doctypeSelectorDirective = function() {
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


app.module.directive('appDoctypeSelector', app.doctypeSelectorDirective);
