goog.provide('app.LoadPreferencesController');
goog.provide('app.loadPreferencesDirective');

goog.require('app');


/**
 * @return {angular.Directive}
 */
app.loadPreferencesDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppLoadPreferencesController',
    controllerAs: 'lpCtrl',
    bindToController: {
      'module': '@appLoadPreferences',
      'url': '@appLoadPreferencesUrl'
    },
    link: function(scope, el, attr, ctrl) {
      el.click(function() {
        ctrl.applyPreferences();
      });
    }
  };
};

app.module.directive('appLoadPreferences', app.loadPreferencesDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @struct
 */
app.LoadPreferencesController = function($scope, ngeoLocation, appApi) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {string}
   * @export
   */
  this.module;

  /**
   * @type {string}
   * @export
   */
  this.url;

  /**
   * @type {?appx.UserPreferences}
   * @private
   */
  this.preferences_;

  /**
   * @type {Object}
   * @private
   */
  this.params_ = {};
};


/**
 * @export
 */
app.LoadPreferencesController.prototype.applyPreferences = function() {
  if (this.preferences_) {
    this.loadPreferences_();
  } else {
    this.api_.readPreferences().then(function(response) {
      this.preferences_ = /** @type {appx.UserPreferences} */ (response['data']);
      this.loadPreferences_();
    }.bind(this));
  }
};


/**
 * @private
 */
app.LoadPreferencesController.prototype.loadPreferences_ = function() {
  var params = this.getParams_();
  if (this.url) {
    var list = [];
    for (var param in params) {
      list.push(param + '=' + params[param]);
    }
    window.location = this.url + '#' + list.join('&');
  } else {
    this.location_.deleteFragmentParam('offset');
    if ('a' in params) {
      this.location_.deleteFragmentParam('bbox');
    }
    this.location_.updateFragmentParams(params);
    this.scope_.$root.$emit('searchFilterChange');
  }
};


/**
 * @return {Object}
 * @private
 */
app.LoadPreferencesController.prototype.getParams_ = function() {
  var params = {};
  var areas, activities;
  switch (this.module) {
    case 'outings':
    case 'routes':
    case 'images':
    case 'xreports':
      areas = this.getAreas_();
      activities = this.getActivities_();
      break;
    case 'waypoints':
      areas = this.getAreas_();
      break;
    case 'books':
    case 'articles':
      activities = this.getActivities_();
      break;
    default:
      break;
  }
  if (areas) params['a'] = areas;
  if (activities) params['act'] = activities;
  return params;
};


/**
 * @return {string}
 * @private
 */
app.LoadPreferencesController.prototype.getAreas_ = function() {
  var data = this.preferences_.areas;
  var areas = [];
  for (var i = 0, n = data.length; i < n; i++) {
    areas.push(data[i].document_id);
  }
  return areas.join(',');
};


/**
 * @return {string}
 * @private
 */
app.LoadPreferencesController.prototype.getActivities_ = function() {
  return this.preferences_.activities.join(',');
};

app.module.controller('AppLoadPreferencesController', app.LoadPreferencesController);
