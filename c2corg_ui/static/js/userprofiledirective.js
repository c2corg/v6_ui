/**
 * @module app.userProfileDirective
 */
import appBase from './index.js';

/**
 * Directive managing the user profile.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    scope: {
      'userId': '@appUserProfile',
      'lang': '@appUserProfileLang'
    },
    controller: 'appUserProfileController',
    controllerAs: 'upCtrl',
    bindToController: true
  };
};

appBase.module.directive('appUserProfile', exports);


export default exports;
