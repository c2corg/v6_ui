goog.provide('app.FollowingController');
goog.provide('app.followingDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');
goog.require('app.utils');


/**
 * Directive managing the list of followed users.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.followingDirective = function() {
  return {
    restrict: 'A',
    controller: 'appFollowingController',
    controllerAs: 'flCtrl'
  };
};


app.module.directive('appFollowing', app.followingDirective);

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 * @export
 */
app.FollowingController = function(appAuthentication, appApi, authUrl) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {Object}
   * @export
   */
  this.following = null;

  /**
   * @type {Array.<number>}
   * @export
   */
  this.followingIds = [];

  if (this.auth_.isAuthenticated()) {
    this.api_.getFollowing().then(function(response) {
      this.following = response['data']['following'];
      this.followingIds = this.following.map(function(user) {
        return user.document_id;
      });
    }.bind(this));
  } else {
    app.utils.redirectToLogin(authUrl);
  }
};


/**
 * @param {number} id Id of user to toggle.
 * @export
 */
app.FollowingController.prototype.toggle = function(id) {
  if (this.followingIds.indexOf(id) > -1) {
    this.api_.unfollow(id).then(function(response) {
      this.followingIds = this.followingIds.filter(function(i) {
        return i != id;
      });
    }.bind(this));
  } else {
    this.api_.follow(id).then(function(response) {
      this.followingIds.push(id);
    }.bind(this));
  }
};


/**
 * @param {appx.User} user
 * @export
 */
app.FollowingController.prototype.addUser = function(user) {
  var id = user.document_id;
  if (this.auth_.userData.id !== id) {
    this.api_.follow(id).then(function(response) {
      this.followingIds.push(id);
      this.following.push(user);
    }.bind(this));
  }
};


app.module.controller('appFollowingController', app.FollowingController);
