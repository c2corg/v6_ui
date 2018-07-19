/**
 * @param {app.Authentication} AuthenticationService
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService
 * @param {string} authUrl Base URL of the authentication page.
 * @param {function(string):string} gettext Marker function provided
 *   by angular-gettext.
 * @constructor
 * @ngInject
 */
export default class UserController {
  constructor(AuthenticationService, ngeoLocation, AlertsService, ApiService, authUrl, gettext, UtilsService) {
    'ngInject';

    this.utilsService_ = UtilsService;

    /**
     * @type {app.Authentication}
     * @export
     */
    this.authenticationService = AuthenticationService;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

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
    this.alerts_ = AlertsService;

    /**
     * @type {function(string):string}
     * @private
     */
    this.gettext = gettext;

    if (this.ngeoLocation_.hasParam('logout')) {
      // Logout from API by removing User data
      this.authenticationService.removeUserData();
    }
  }


  /**
   * @export
   */
  showLogin() {
    this.utilsService_.redirectToLogin(this.authUrl_);
  }


  /**
   * @export
   */
  logout() {
    this.apiService_.logoutFromApiAndDiscourse().then(() => {
      this.alerts_.addSuccess(this.gettext('You have been disconnected'));
    }).finally(() => {
      this.authenticationService.removeUserData();
      const path = this.ngeoLocation_.getPath();
      if (path.indexOf('/edit/') !== -1 || path.indexOf('/account') !== -1) {
        // The user is editing a document or viewing the account configuration.
        // Going to the authentication page.
        this.showLogin();
      }
    });
  }


  /**
   * @param {string} doctype
   * @param {Object} options
   * @param {boolean=} opt_protected
   * @return {boolean}
   * @export
   */
  hasEditRights(doctype, options, opt_protected) {
    if (opt_protected && !this.isModerator()) {
      return false;
    }
    return this.authenticationService.hasEditRights(doctype, options);
  }


  /**
   * @return {boolean}
   * @export
   */
  isModerator() {
    return this.authenticationService.isModerator();
  }

  /**
   * @export
   */
  goToOutingsPage() {
    window.location.href = '/outings#u=' + this.authenticationService.userData.id;
    window.location.reload();
  }
}
