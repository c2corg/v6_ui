/**
 * @module app.FollowController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @struct
 */
const exports = function(appAuthentication, appApi) {

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
exports.prototype.canFollow = function() {
  return this.auth_.isAuthenticated() && this.auth_.userData.id !== this.docId;
};


/**
 * @export
 */
exports.prototype.toggle = function() {
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


appBase.module.controller('appFollowController', exports);


export default exports;
