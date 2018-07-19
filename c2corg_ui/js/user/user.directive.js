import template from './user.html';

/**
 * This directive is used to display the user tools if authenticated or
 * the sign up button if not.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const UserDirective = () => {
  'ngInject';

  return {
    restrict: 'E',
    controller: 'UserController',
    controllerAs: 'userCtrl',
    bindToController: true,
    template
  };
};

export default UserDirective;
