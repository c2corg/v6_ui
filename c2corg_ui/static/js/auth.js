goog.provide('app.AuthController');
goog.provide('app.authDirective');

goog.require('app');


/**
 * This directive is used to manage the sign in/up forms.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.authDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appAuthController',
    controllerAs: 'authCtrl',
    bindToController: true
  };
};


app.module.directive('appAuth', app.authDirective);



/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @export
 * @ngInject
 */
app.AuthController = function($scope, $http, apiUrl) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;
};


/**
 * @export
 */
app.AuthController.prototype.signIn = function() {
  this.http_.post(this.buildUrl_('login'), this.scope_['signIn'], {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json, text/plain, /'
    }
  }).then(
      goog.bind(this.successSignIn_, this),
      goog.bind(this.errorSignIn_, this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successSignIn_ = function(response) {
  console.log('signIn success');
  console.log(response);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorSignIn_ = function(response) {
  console.log('signIn error');
  console.log(response);
};


/**
 * @export
 */
app.AuthController.prototype.signUp = function() {
  this.http_.post(this.buildUrl_('register'), this.scope_['signUp'], {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json, text/plain, /'
    }
  }).then(
      goog.bind(this.successSignUp_, this),
      goog.bind(this.errorSignUp_, this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successSignUp_ = function(response) {
  console.log('signUp success');
  console.log(response);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorSignUp_ = function(response) {
  console.log('signUp error');
  console.log(response);
};


/**
 * @param {string} action Action.
 * @return {string} URL.
 * @private
 */
app.AuthController.prototype.buildUrl_ = function(action) {
  return '{base}/users/{action}'
      .replace('{base}', this.apiUrl_)
      .replace('{action}', action);
};


app.module.controller('appAuthController', app.AuthController);
