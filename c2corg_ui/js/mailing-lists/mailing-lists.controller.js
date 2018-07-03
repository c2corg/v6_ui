import {assert} from 'goog/asserts';

/**
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
export default class MailingListsController {
  constructor(AuthenticationService, ApiService, authUrl, UtilsService) {
    'ngInject';

    /**
    * @type {app.Api}
    * @private
    */
    this.apiService_ = ApiService;

    /**
    * @type {Object}
    * @export
    */
    this.mailinglists = null;

    if (AuthenticationService.isAuthenticated()) {
      this.apiService_.readMailinglists().then((response) => {
        this.mailinglists = response['data'];
      });
    } else {
      UtilsService.redirectToLogin(authUrl);
    }
  }

  /**
  * @param {string} listname
  * @export
  */
  toggle(listname) {
    assert(listname in this.mailinglists);
    const data = {};
    data[listname] = !this.mailinglists[listname];
    this.apiService_.updateMailinglists(data);
  }
}
