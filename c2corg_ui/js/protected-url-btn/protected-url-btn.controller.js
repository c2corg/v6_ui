/**
 * @param {app.Authentication} AuthenticationService
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
export default class ProtectUrlBtnController {
  constructor(AuthenticationService, authUrl) {
    'ngInject';

    /**
     * @type {app.Authentication}
     * @private
     */
    this.authenticationService_ = AuthenticationService;

    /**
     * @type {string}
     * @private
     */
    this.authUrl_ = authUrl;
  }

  redirectToProtectedUrl(url) {
    if (this.authenticationService_.isAuthenticated()) {
      window.location.href = url;
    } else {
      window.location.href = '{authUrl}#to={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(url));
    }
  }
}
