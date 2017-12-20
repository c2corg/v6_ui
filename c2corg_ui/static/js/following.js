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

  /**
   * @type {Array.<number>}
   * @private
   */
  this.pausedIds_ = [];

  if (this.auth_.isAuthenticated()) {
    this.api_.getFollowing().then((response) => {
      this.following = response['data']['following'];
      this.followingIds = this.following.map((user) => {
        return user.document_id;
      });
    });
  } else {
    app.utils.redirectToLogin(authUrl);
  }
};


/**
 * @param {number} id Id of user to toggle.
 * @export
 */
app.FollowingController.prototype.toggle = function(id) {
  let index = this.followingIds.indexOf(id);
  if (index > -1) {
    // user was already followed => unfollow/paused them
    this.api_.unfollow(id).then((response) => {
      this.followingIds.splice(index, 1);
      this.pausedIds_.push(id);
    });
  } else {
    // user was paused/not followed => follow/unpause them
    this.api_.follow(id).then((response) => {
      this.followingIds.push(id);
      let pIndex = this.pausedIds_.indexOf(id);
      if (pIndex > -1) {
        this.pausedIds_.splice(pIndex, 1);
      }
    });
  }
};


/**
 * @param {appx.User} user
 * @export
 */
app.FollowingController.prototype.addUser = function(user) {
  let id = user.document_id;
  if (this.followingIds.indexOf(id) > -1 || this.auth_.userData.id === id) {
    // do nothing if user to add is already followed or is the current user
    return;
  }

  this.api_.follow(id).then((response) => {
    this.followingIds.push(id);
    let pIndex = this.pausedIds_.indexOf(id);
    if (pIndex > -1) {
      // user is paused => no need to add them to the list, only unpause them
      this.pausedIds_.splice(pIndex, 1);
    } else {
      this.following.push(user);
    }
  });
};


app.module.controller('appFollowingController', app.FollowingController);
