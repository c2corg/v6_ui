goog.provide('app.UserController');
goog.provide('app.userDirective');

goog.require('app');


/**
 * This directive is used to display the user tools if authenticated or
 * the sign up button if not.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.userDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'signinUrl': '@appUserSigninUrl'
    },
    controller: 'AppUserController',
    controllerAs: 'userCtrl',
    bindToController: true,
    templateUrl: '/static/partials/user.html'
  };
};


app.module.directive('appUser', app.userDirective);



/**
 * @constructor
 * @export
 * @ngInject
 */
app.UserController = function() {

};


/**
 * @export
 */
app.UserController.prototype.showSignIn = function() {
  window.location.href = this['signinUrl'];
};


app.module.controller('AppUserController', app.UserController);
