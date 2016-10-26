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
      'userId' : '=appFeedProfile'
    },
    templateUrl: '/static/partials/feed.html'
  };
};
app.module.directive('appFeed', app.feedDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @ngInject
 * @export
 * @struct
 */
app.FeedController = function(appAuthentication, appApi, appLang, imageUrl) {

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
   * @type {string}
   * @private
   */
  this.imageUrl_ = imageUrl;

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
   * @type {boolean}
   * @export
   */
  this.end = false;

  /**
   * @type {boolean}
   * @export
   */
  this.noFeed = false;

  /**
   * @type {boolean}
   * @export
   */
  this.feedEnd = false;

  /**
   * @type {?number}
   * @export
   */
  this.userId;

  /**
   * @type {boolean}
   * @export
   */
  this.isPersonal = !this.userId;

  this.getDocumentsFromFeed();
};


/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 */
app.FeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  this.api_.readFeed(this.nextToken_, this.lang_.getLang(), this.userId, this.isPersonal).then(function(response) {
    this.error = false;
    this.busy = false;
    var data = response['data']['feed'];
    var token = response['data']['pagination_token'];
    this.nextToken_ = token;

    for (var i = 0; i < data.length; i++) {
      this.documents.push(data[i]);
    }
    if ((token && data.length === 0) || (!token && this.documents.length > 0)) {  // reached the end of the feed - disable scroll
      this.feedEnd = true;
    } else if (data.length === 0) { // first fetch with no feed returned.
      this.noFeed = true;
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
    case 'added_photos':
      line += 'has added images to ';
      break;
    default:
      break;
  }
  return line + this.documentType(doc['document']['type']);
};


/**
 * Switches between /personal-feed and /feed
 * @export
 */
app.FeedController.prototype.toggleFilters = function() {
  this.isPersonal = !this.isPersonal;
  this.nextToken_ = undefined;
  this.documents = [];
  this.getDocumentsFromFeed();
  window.scrollTo(0, 0);
};


/**
 * @param {string} filename
 * @param {string} suffix
 * @return {string}
 * @export
 */
app.FeedController.prototype.createImageUrl = function(filename, suffix) {
  return this.imageUrl_ + app.utils.createImageUrl(filename, suffix);
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
