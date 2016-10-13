goog.provide('app.FeedController');
goog.provide('app.feedDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Api');
goog.require('app.Authentication');
goog.require('app.utils');


/**
 * @return {angular.Directive} The directive specs.
 */
app.feedDirective = function() {
  return {
    restrict: 'A',
    controller: 'appFeedController as feedCtrl'
  };
};
app.module.directive('appFeed', app.feedDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Authentication} appAuthentication
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {angular.$sce} $sce Angular Strict Contextual Escaping
 * @constructor
 * @ngInject
 * @export
 */
app.FeedController = function($scope, $attrs, appAuthentication, appAlerts,
    appApi, authUrl, $sce) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {angular.$sce} $sce Angular Strict Contextual Escaping
   * @private
   */
  this.sce_ = $sce;

  /**
   * @type {string}
   * @private
   */
  this.location_ = $attrs['location'];

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documents = [];

  /**
   * @type {string | undefined}
   * @private
   */
  this.nextToken_;

  /**
   * @type {boolean}
   * @export
   */
  this.busy = true;

  /**
   * @type {string}
   * @private
   */
  this.feedType_;

  switch (this.location_) {
    case 'home':
      this.feedType_ = this.auth_.isAuthenticated() ? 'personal' : 'standard';
      break;
    case 'user-profile':
      this.feedType_ = 'profile';
      break;
    default:
      break;
  }

  this.getDocumentsFromFeed();
};


/**
 * @export
 */
app.FeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  this.api_.readFeed(this.feedType_, this.nextToken_).then(function(response) {
    var data = response['data']['feed'];
    for (var i = 0; i < data.length; i++) {
      this.documents.push(data[i]);
    }
    this.nextToken_ = response['data']['pagination_token'];
    this.busy = false;
    data = [];
  }.bind(this));
};


/**
 * Creates a HTML with action that user used on the document in the feed.
 * Will be useful for verbs like 'created', 'updated', 'associated xx', 'went hiking with xx'.
 * @return {string | *} line
 * @export
 */
app.FeedController.prototype.createActionLine = function(doc) {
  var line = '';

  switch (doc['change_type']) {
    case 'created':
      line += ' <span>has created a new</span> ';
      break;
    case 'updated':
      line += ' <span>has updated the</span> ';
      break;
    default:
      break;
  }
  return this.sce_.trustAsHtml(line);
};

/**
 * document type without 's' (singular form)
 * @export
 * @returns {string}
 */
app.FeedController.prototype.documentType = function(type) {
  return app.utils.getDoctype(type).slice(0, -1);
};

app.module.controller('appFeedController', app.FeedController);
