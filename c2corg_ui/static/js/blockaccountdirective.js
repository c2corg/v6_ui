goog.provide('app.blockAccountDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.blockAccountDirective = function() {
  return {
    restrict: 'A',
    controller: 'appBlockAccountController',
    controllerAs: 'blockCtrl',
    bindToController: {
      'userId': '=appUserId'
    },
    templateUrl: '/static/partials/blockaccount.html'
  };
};
app.module.directive('appBlockAccount', app.blockAccountDirective);
