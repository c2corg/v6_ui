/**
 * @module app.followingDirective
 */
import appBase from './index.js';

/**
 * Directive managing the list of followed users.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'appFollowingController',
    controllerAs: 'flCtrl'
  };
};


export default exports;
