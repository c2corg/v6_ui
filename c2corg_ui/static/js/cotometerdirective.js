goog.provide('app.cotometerDirective');

goog.require('app');

/**
 * This directive is used to manage the dialog of cotometer
 * cotometerRating function was developed and made available with the support of BLMS http://paleo.blms.free.fr
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cotometerDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppCotometerController',
    controllerAs: 'cotmetCtrl',
    templateUrl: '/static/partials/cotometer.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

app.module.directive('appCotometer', app.cotometerDirective);
