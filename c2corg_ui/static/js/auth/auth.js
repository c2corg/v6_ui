goog.provide('app.AuthController');
goog.provide('app.authDirective');

goog.require('app');
goog.require('app.Authentication');
goog.require('ngeo.Location');


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
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.ControllerHub} appControllerHub Controller hub service
 * @constructor
 * @export
 * @ngInject
 */
app.AuthController = function($scope, $http, apiUrl, appAuthentication,
    ngeoLocation, appControllerHub) {

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

  /**
   * @type {app.Authentication}
   * @private
   */
  this.appAuthentication_ = appAuthentication;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {app.ControllerHub}
   * @private
   */
  this.ctrlHub_ = appControllerHub;
};


/**
 * @export
 */
app.AuthController.prototype.login = function() {
  var login = this.scope_['login'];
  var remember = !!login['remember']; // a true boolean
  this.http_.post(this.buildUrl_('login'), login, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      goog.bind(this.successLogin_, this, remember),
      goog.bind(this.errorLogin_, this)
  );
};


/**
 * @param {boolean} remember whether to store the data in local storage.
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successLogin_ = function(remember, response) {
  var data = /** @type {appx.AuthData} */ (response['data']);
  data.remember = remember;
  this.appAuthentication_.setUserData(data);
  // redirect to previous page
  var url_from = this.ngeoLocation_.hasParam('from') ?
      decodeURIComponent(this.ngeoLocation_.getParam('from')) : '/';
  window.location.href = url_from;
  // TODO: add a welcome alert message on redirected page
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorLogin_ = function(response) {
  // TODO: i18n
  this.ctrlHub_.alert.addAlert({
    type: 'danger',
    msg: 'Login failed'
  });
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
  // TODO: i18n
  this.ctrlHub_.alert.addAlert({
    type: 'success',
    msg: 'Registration success'
  });
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.errorRegister_ = function(response) {
  // TODO: i18n
  // FIXME: HTML is not interpreted in alert messages
  var msg = 'Registration failed because of:';
  var errors = response['data']['errors'],
      len = errors.length;
  if (len > 0) {
    msg += '<ul>';
    for (var i = 0; i < len; i++) {
      msg += '<li>' + errors[i]['description'] + '</li>';
    }
    msg += '</ul>';
  }
  this.ctrlHub_.alert.addAlert({type: 'danger', msg: msg});
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
