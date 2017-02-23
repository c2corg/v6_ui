goog.provide('app.PreferencesController');
goog.provide('app.preferencesDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');
goog.require('app.utils');


/**
 * Directive managing the user preferences.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.preferencesDirective = function() {
  return {
    restrict: 'A',
    controller: 'appPreferencesController',
    controllerAs: 'prefCtrl'
  };
};

app.module.directive('appPreferences', app.preferencesDirective);

/**
 * @param {angular.$cookies} $cookies Cookies service.
 * @param {angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 */
app.PreferencesController = function($scope, $cookies, appAuthentication, appApi,
    authUrl) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$cookies}
   * @private
   */
  this.cookies_ = $cookies;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {Array.<string>}
   * @public
   */
  this.lang_preferences = [];

  /**
   * @type {Array.<string>}
   * @export
   */
  this.activities = [];

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
    this.api_.readPreferences().then(function(response) {
      var data = /** @type {appx.UserPreferences} */ (response['data']);
      this.activities = data.activities;
      this.areas = data.areas;
      this.followed_only = data.followed_only;
      this.lang_preferences = data.lang_preferences;

      console.log('data jsou po otevr. stranky ...', data);

      this.scope_.$watch(function() {
        return this.followed_only;
      }.bind(this), function(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.save_();
        }
      }.bind(this));
    }.bind(this));
  } else {
    app.utils.redirectToLogin(authUrl);
  }
};


/**
 * @param {string} activity
 * @export
 */
app.PreferencesController.prototype.updateActivities = function(activity) {
  if (this.activities.indexOf(activity) > -1) {
    this.activities = this.activities.filter(function(item) {
      return item !== activity;
    });
  } else {
    this.activities.push(activity);
  }
  this.save_();
};


/**
 * @param {string} language
 * @export
 */
app.PreferencesController.prototype.updateLanguages = function(language) {
  if (this.lang_preferences.indexOf(language) > -1) {
    this.lang_preferences = this.lang_preferences.filter(function(item) {
      return item !== language;
    });
  } else {
    this.lang_preferences.push(language);
  }

  console.log('inserting cookie', this.lang_preferences.join(','));
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1); // today + 1 year
  this.cookies_.put('preferred_lang', this.lang_preferences.join(','), {
    'path': '/',
    'expires': d
  });

  console.log('aktualni preference v Cookie a ulozeni', this.lang_preferences);

  this.save_();
};

//
// /**
//  * @return {string}
//  * @public
//  */
// app.PreferencesController.prototype.getLanguagePreference = function() {
//   return this.lang_preferences || 'es';
// };


/**
 * @param {appx.Area} area
 * @export
 */
app.PreferencesController.prototype.addArea = function(area) {
  var alreadyInList = this.areas.some(function(a) {
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
app.PreferencesController.prototype.removeArea = function(id) {
  this.areas = this.areas.filter(function(item) {
    return item.document_id !== id;
  });
  this.save_();
};


/**
 * @private
 */
app.PreferencesController.prototype.save_ = function() {
  console.log('...saving lang. preference ...' , this.lang_preferences);
  var data = {
    'lang_preferences': this.lang_preferences,
    'activities': this.activities,
    'areas': this.areas,
    'followed_only': this.followed_only
  };
  this.api_.updatePreferences(data);
};


app.module.controller('appPreferencesController', app.PreferencesController);
