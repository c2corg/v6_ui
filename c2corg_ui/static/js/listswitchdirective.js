/**
 * @module app.listSwitchDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
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

appBase.module.directive('appListSwitch', exports);


export default exports;
