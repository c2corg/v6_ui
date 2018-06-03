goog.provide('app.userProfileDirective');

goog.require('app');


/**
 * Directive managing the user profile.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.userProfileDirective = function() {
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

app.module.directive('appUserProfile', app.userProfileDirective);
