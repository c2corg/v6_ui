/**
 * Directive managing the user profile.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const UserProfileDirective = () => {
  return {
    restrict: 'A',
    scope: {
      'userId': '@c2cUserProfile',
      'lang': '@c2cUserProfileLang'
    },
    controller: 'UserProfileController',
    controllerAs: 'upCtrl',
    bindToController: true
  };
};

export default UserProfileDirective;
