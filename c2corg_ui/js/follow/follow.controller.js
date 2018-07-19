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
    this.authenticationService_ = AuthenticationService;

    /**
     * @type {boolean}
     * @export
     */
    this.followed = false;
  }

  $onInit() {
    if (this.canFollow()) {
      this.apiService_.isFollowing(this.docId).then(response => {
        this.followed = response.data.is_following;
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
    return this.authenticationService_.isAuthenticated() && this.authenticationService_.userData.id !== this.docId;
  }


  /**
   * @export
   */
  toggle() {
    if (this.followed) {
      this.apiService_.unfollow(this.docId).then(() => {
        this.followed = false;
      });
    } else {
      this.apiService_.follow(this.docId).then(() => {
        this.followed = true;
      });
    }
  }
}
