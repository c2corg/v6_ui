goog.provide('app.FollowController');

goog.require('app');


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @struct
 */
app.FollowController = function(appAuthentication, appApi) {

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
   * @type {number}
   * @export
   */
  this.docId;

  /**
   * @type {boolean}
   * @export
   */
  this.followed = false;

  if (this.canFollow()) {
    this.api_.isFollowing(this.docId).then((response) => {
      this.followed = response['data']['is_following'];
    });
  }
};


/**
 * Figure out if the visitor can follow this page:
 * - only auth users may follow
 * - users may not follow themselves
 *
 * @export
 */
app.FollowController.prototype.canFollow = function() {
  return this.auth_.isAuthenticated() && this.auth_.userData.id !== this.docId;
};


/**
 * @export
 */
app.FollowController.prototype.toggle = function() {
  if (this.followed) {
    this.api_.unfollow(this.docId).then((response) => {
      this.followed = false;
    });
  } else {
    this.api_.follow(this.docId).then((response) => {
      this.followed = true;
    });
  }
};


app.module.controller('appFollowController', app.FollowController);
