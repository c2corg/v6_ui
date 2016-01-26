goog.provide('app.UserController');
goog.provide('app.userDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('ngeo.Location');


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
    controller: 'AppUserController',
    controllerAs: 'userCtrl',
    bindToController: true,
    templateUrl: '/static/partials/user.html',
    link:
         /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} el Element.
         * @param {angular.Attributes} attrs Atttributes.
         */
          function(scope, el, attrs) {
            var phoneScreen = 619;

           // Remove text when screen width < @phone and show icon instead.
           // Has to wait for document.ready, if not - the function is triggered on a non existing element.
           $(document).ready(function() {

              if  (window.innerWidth < phoneScreen) {
                el.find('button').addClass('glyphicon glyphicon-user');
              }
              // Same on resize, cf ^up
              $(window).resize(function resize() {
                if ($(window).width() < phoneScreen) {
                  el.find('button').addClass('glyphicon glyphicon-user');
                }else {
                  el.find('button').removeClass('glyphicon glyphicon-user');
                }
              });
           });
          }
    };
};

app.module.directive('appUser', app.userDirective);


/**
 * @param {angular.$http} $http
 * @param {app.Authentication} appAuthentication
 * @param {string} apiUrl Base URL of the API.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @export
 * @ngInject
 */
app.UserController = function($http, appAuthentication, apiUrl, ngeoLocation,
    appAlerts, authUrl) {

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {app.Authentication}
   * @export
   */
  this.auth = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;
};


/**
 * @export
 */
app.UserController.prototype.showLogin = function() {
  var current_url = this.ngeoLocation_.getUriString();
  window.location.href = '{login}?from={current}'
      .replace('{login}', this.authUrl_)
      .replace('{current}', encodeURIComponent(current_url));
};


/**
 * @export
 */
app.UserController.prototype.logout = function() {
  this.http_.post(this.apiUrl_ + '/users/logout', {
    'discourse': true
  }, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  }).then(
      this.successLogout_.bind(this),
      this.errorLogout_.bind(this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.UserController.prototype.successLogout_ = function(response) {
  this.auth.removeUserData();
  this.alerts_.addSuccess('You have been disconnected');
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.UserController.prototype.errorLogout_ = function(response) {
  this.auth.removeUserData();
  this.alerts_.addError(response);
};


app.module.controller('AppUserController', app.UserController);
