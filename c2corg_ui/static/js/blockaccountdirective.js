/**
 * @module app.blockAccountDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
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

appBase.module.directive('appBlockAccount', exports);


export default exports;
