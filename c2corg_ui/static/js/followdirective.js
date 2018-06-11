/**
 * @module app.followDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appFollowController',
    controllerAs: 'followCtrl',
    bindToController: {
      'docId': '=appFollowId'
    },
    templateUrl: '/static/partials/follow.html'
  };
};

appBase.module.directive('appFollow', exports);


export default exports;
