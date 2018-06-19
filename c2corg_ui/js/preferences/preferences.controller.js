/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} AuthenticationService
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
export default class PreferencesController {
  constructor($scope, AuthenticationService, ApiService, UtilsService, authUrl) {
    'ngInject';

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {Array.<string>}
     * @export
     */
    this.activities = [];

    /**
     * @type {Array.<string>}
     * @export
     */
    this.langs = [];

    /**
     * @type {Array.<appx.Area>}
     * @export
     */
    this.areas = [];

    /**
     * @type {boolean}
     * @export
     */
    this.followed_only = false;

    if (AuthenticationService.isAuthenticated()) {
      this.apiService_.readPreferences().then(response => {
        const data = /** @type {appx.UserPreferences} */ (response['data']);
        this.activities = data.activities;
        this.langs = data.langs;
        this.areas = data.areas;
        this.followed_only = data.followed_only;

        this.scope_.$watch(() => {
          return this.followed_only;
        }, (newValue, oldValue) => {
          if (newValue !== oldValue) {
            this.save_();
          }
        });
      });
    } else {
      UtilsService.redirectToLogin(authUrl);
    }
  }


  /**
   * @param {string} activity
   * @export
   */
  updateActivities(activity) {
    if (this.activities.indexOf(activity) > -1) {
      this.activities = this.activities.filter((item) => {
        return item !== activity;
      });
    } else {
      this.activities.push(activity);
    }
    this.save_();
  }


  /**
   * @param {string} lang
   * @export
   */
  updateLangs(lang) {
    if (this.langs.indexOf(lang) > -1) {
      this.langs = this.langs.filter((item) => {
        return item !== lang;
      });
    } else {
      this.langs.push(lang);
    }
    this.save_();
  }


  /**
   * @param {appx.Area} area
   * @export
   */
  addArea(area) {
    const alreadyInList = this.areas.some((a) => {
      return a.document_id === area.document_id;
    });
    if (alreadyInList) {
      return;
    }
    this.areas.push(area);
    this.save_();
  }


  /**
   * @param {number} id Area document_id.
   * @export
   */
  removeArea(id) {
    this.areas = this.areas.filter((item) => {
      return item.document_id !== id;
    });
    this.save_();
  }


  /**
   * @private
   */
  save_() {
    const data = {
      'activities': this.activities,
      'langs': this.langs,
      'areas': this.areas,
      'followed_only': this.followed_only
    };
    this.apiService_.updatePreferences(data);
  }
}
