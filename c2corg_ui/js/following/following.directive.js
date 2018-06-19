/**
 * Directive managing the list of followed users.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const FollowingDirective = () => {
  return {
    restrict: 'A',
    controller: 'FollowingController',
    controllerAs: 'flCtrl'
  };
};

export default FollowingDirective;
