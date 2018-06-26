/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Api} ApiService The API service
 * @param {app.Authentication} AuthenticationService
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
export default class MainController {
  constructor($scope, gettextCatalog, ApiService, AuthenticationService, authUrl, UtilsService) {
    'ngInject';

    this.utilsService_ = UtilsService;

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {angularGettext.Catalog}
     * @private
     */
    this.gettextCatalog_ = gettextCatalog;

    /**
     * @type {app.Api}
     * @export
     */
    this.apiService = ApiService;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.auth_ = AuthenticationService;

    /**
     * @type {string}
     * @private
     */
    this.authUrl_ = authUrl;
  }


  /**
   * @param {string} str String to translate.
   * @return {string} Translated string.
   * @export
   */
  translate(str) {
    return this.gettextCatalog_.getString(str);
  }

  /**
   * @param {string} title String page title
   * @return {string} concatenated and translated page title
   * @export
   */
  page_title(title) {
    return this.translate(title) + ' - Camptocamp.org';
  }

  /**
   * @param {string} path
   * @export
   * function returning true if the window.location.pathname contains
   * the path parameter. Only exceptions are 'topoguide', where all
   * kinds of documents are associated, and '/' (home).
   * TODO : add an array of possible document types and make a for loop
   */
  isPath(path) {
    const location = window.location.pathname;
    if (path === location) {
      // path = '/'
      return 'home';
    } else if (path === 'topoguide') {
      return this.utilsService_.isTopoguide(location.substring(1));
    }
    return location.indexOf(path) > -1;
  }


  /**
   * @export
   */
  animateHeaderIcon(e) {
    this.utilsService_.animateHeaderIcon(e);
  }


  /**
   * @export
   */
  resizeMap() {
    this.scope_.$root.$emit('resizeMap');
  }
}
