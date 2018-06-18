/**
 * @module app.FollowController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 * @struct
 */
const exports = function(AuthenticationService, ApiService) {

  /**
   * @type {app.Api}
   * @private
   */
  this.apiService_ = ApiService;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = AuthenticationService;

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
    this.apiService_.isFollowing(this.docId).then((response) => {
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
    this.apiService_.unfollow(this.docId).then((response) => {
      this.followed = false;
    });
  } else {
    this.apiService_.follow(this.docId).then((response) => {
      this.followed = true;
    });
  }
};


appBase.module.controller('appFollowController', exports);


export default exports;
