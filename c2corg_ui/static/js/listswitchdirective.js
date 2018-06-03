goog.provide('app.listSwitchDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.listSwitchDirective = function() {
  return {
    restrict: 'E',
    controller: 'appListSwitchController',
    controllerAs: 'switchCtrl',
    link: function(scope, element, attrs) {
      scope.type = attrs.type;
    },
    templateUrl: '/static/partials/listswitch.html'
  };
};
app.module.directive('appListSwitch', app.listSwitchDirective);
