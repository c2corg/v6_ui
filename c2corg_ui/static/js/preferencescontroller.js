/**
 * @module app.PreferencesController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
const exports = function($scope, appAuthentication, ApiService, authUrl) {

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

  if (appAuthentication.isAuthenticated()) {
    this.apiService_.readPreferences().then((response) => {
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
    appUtils.redirectToLogin(authUrl);
  }
};


/**
 * @param {string} activity
 * @export
 */
exports.prototype.updateActivities = function(activity) {
  if (this.activities.indexOf(activity) > -1) {
    this.activities = this.activities.filter((item) => {
      return item !== activity;
    });
  } else {
    this.activities.push(activity);
  }
  this.save_();
};


/**
 * @param {string} lang
 * @export
 */
exports.prototype.updateLangs = function(lang) {
  if (this.langs.indexOf(lang) > -1) {
    this.langs = this.langs.filter((item) => {
      return item !== lang;
    });
  } else {
    this.langs.push(lang);
  }
  this.save_();
};


/**
 * @param {appx.Area} area
 * @export
 */
exports.prototype.addArea = function(area) {
  const alreadyInList = this.areas.some((a) => {
    return a.document_id === area.document_id;
  });
  if (alreadyInList) {
    return;
  }
  this.areas.push(area);
  this.save_();
};


/**
 * @param {number} id Area document_id.
 * @export
 */
exports.prototype.removeArea = function(id) {
  this.areas = this.areas.filter((item) => {
    return item.document_id !== id;
  });
  this.save_();
};


/**
 * @private
 */
exports.prototype.save_ = function() {
  const data = {
    'activities': this.activities,
    'langs': this.langs,
    'areas': this.areas,
    'followed_only': this.followed_only
  };
  this.apiService_.updatePreferences(data);
};


appBase.module.controller('appPreferencesController', exports);


export default exports;
