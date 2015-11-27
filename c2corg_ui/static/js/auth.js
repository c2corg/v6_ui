goog.provide('app.AuthController');
goog.provide('app.authDirective');

goog.require('app');


/**
 * This directive is used to manage the login/register forms.
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
app.AuthController.prototype.login = function() {
  this.http_.post(this.buildUrl_('login'), this.scope_['login'], {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      goog.bind(this.successLogin_, this),
      goog.bind(this.errorLogin_, this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successLogin_ = function(response) {
  console.log('login success');
  console.log(response);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorLogin_ = function(response) {
  console.log('login error');
  console.log(response);
};


/**
 * @export
 */
app.AuthController.prototype.register = function() {
  this.http_.post(this.buildUrl_('register'), this.scope_['register'], {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      goog.bind(this.successRegister_, this),
      goog.bind(this.errorRegister_, this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successRegister_ = function(response) {
  console.log('register success');
  console.log(response);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorRegister_ = function(response) {
  console.log('register error');
  console.log(response);
};


/**
 * @export
 */
app.AuthController.prototype.showNewPassForm = function() {
  alert('TODO');
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
