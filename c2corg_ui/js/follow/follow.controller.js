/**
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 * @struct
 */
export default class FollowController {
  constructor(AuthenticationService, ApiService) {
    'ngInject';

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
  }


  /**
   * Figure out if the visitor can follow this page:
   * - only auth users may follow
   * - users may not follow themselves
   *
   * @export
   */
  canFollow() {
    return this.auth_.isAuthenticated() && this.auth_.userData.id !== this.docId;
  }


  /**
   * @export
   */
  toggle() {
    if (this.followed) {
      this.apiService_.unfollow(this.docId).then((response) => {
        this.followed = false;
      });
    } else {
      this.apiService_.follow(this.docId).then((response) => {
        this.followed = true;
      });
    }
  }
}
