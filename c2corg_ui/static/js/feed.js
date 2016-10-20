goog.provide('app.FeedController');
goog.provide('app.feedDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');
goog.require('app.utils');


/**
 * @return {angular.Directive} The directive specs.
 */
app.feedDirective = function() {
  return {
    restrict: 'E',
    controller: 'appFeedController as feedCtrl',
    bindToController: {
      'isProfile' : '=appFeedProfile'
    },
    templateUrl: '/static/partials/feed.html'
  };
};
app.module.directive('appFeed', app.feedDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 * @export
 * @struct
 */
app.FeedController = function($scope, $attrs, appAuthentication, appApi, appLang) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

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
   * @type {app.Lang}
   * @private
   */
  this.lang_ = appLang;

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
   * @type {boolean}
   * @export
   */
  this.error = false;

  /**
   * set in the directive's template
   * @type {boolean}
   * @export
   */
  this.isProfile;

  /**
   * Used also in the template
   * @type {boolean}
   * @export
   */
  this.isPersonal = !this.isProfile;

  this.getDocumentsFromFeed();
};


/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 */
app.FeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  this.api_.readFeed(this.nextToken_, this.lang_.getLang(), this.isProfile, this.isPersonal).then(function(response) {
    this.error = false;
    var data = response['data']['feed'];
    var token = response['data']['pagination_token'];
    for (var i = 0; i < data.length; i++) {
      this.documents.push(data[i]);
    }
    if (token) {
      this.nextToken_ = token;
      this.busy = false;
    } else {  // if no token = reached the end of the feed - disable scroll
      this.busy = true;
    }
  }.bind(this), function() { // Error msg is shown in the api service
    this.busy = false;
    this.error = true;
  }.bind(this));
};


/**
 * Creates a HTML with action that user used on the document in the feed.
 * Will be useful for verbs like 'created', 'updated', 'associated xx', 'went hiking with xx'.
 * @return {string} line
 * @export
 */
app.FeedController.prototype.createActionLine = function(doc) {
  var line = '';

  switch (doc['change_type']) {
    case 'created':
      line += 'has created a new ';
      break;
    case 'updated':
      line += 'has updated the ';
      break;
    default:
      break;
  }
  return line + this.documentType(doc['document']['type']);
};

/**
 * Switches between /personal-feed and /feed
 */
app.FeedController.prototype.toggleFilters = function() {
  this.isPersonal = !this.isPersonal;
  this.nextToken_ = undefined;
  this.documents = [];
  this.getDocumentsFromFeed();
  window.scrollTo(0, 0);
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
