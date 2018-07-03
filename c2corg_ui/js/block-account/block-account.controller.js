/**
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 * @struct
 */
export default class BlockAccountController {
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
    this.userId;

    /**
     * @type {boolean}
     * @export
     */
    this.accountBlocked = false;

    if (this.auth_.isModerator()) {
      this.apiService_.isAccountBlocked(this.userId).then((response) => {
        this.accountBlocked = response['data']['blocked'];
      });
    }
  }


  /**
   * @export
   */
  block() {
    this.apiService_.blockAccount(this.userId).then((response) => {
      this.accountBlocked = true;
    });
  }


  /**
   * @export
   */
  unblock() {
    this.apiService_.unblockAccount(this.userId).then((response) => {
      this.accountBlocked = false;
    });
  }
}
