goog.provide('app.UserProfileController');
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

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Alerts} appAlerts
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.UserProfileController = function($scope, $http, $compile, appAlerts) {

  /**
   * @type {number}
   * @export
   */
  this.userId;

  /**
   * @type {string}
   * @export
   */
  this.lang;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * An authenticated request is made to the ui server to get the profile data
   * as rendered HTML (profiles can be marked as non-public).
   */
  var url = '/profiles/data/{id}/{lang}'
    .replace('{id}', this.userId.toString())
    .replace('{lang}', this.lang);
  var promise = $http.get(url);
  promise.catch(function(response) {
    this.alerts_.addErrorWithMsg(
      this.alerts_.gettext('An error occured while loading this profile'),
      response);
  }.bind(this));
  promise.then(function(response) {
    var element = angular.element('#user-profile-data');
    element.html(response['data']);
    $compile(element.contents())($scope.$parent);
  }.bind(this));
};


app.module.controller('appUserProfileController', app.UserProfileController);
