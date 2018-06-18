/**
 * This directive is used to manage the login/register forms.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const AuthDirective = () => {
  return {
    restrict: 'A',
    scope: true,
    controller: 'AuthController',
    controllerAs: 'authCtrl',
    bindToController: true
  };
};

export default AuthDirective;
