goog.provide('app.WhatsnewFeedController');
goog.provide('app.whatsnewFeedDirective');

goog.require('app');
goog.require('app.utils');

/**
 * @return {angular.Directive} The directive specs.
 */
app.whatsnewFeedDirective = function() {
  return {
    restrict: 'E',
    controller: 'appWhatsnewFeedController as wfeedCtrl',
    templateUrl: '/static/partials/whatsnew.html'
  };
};
app.module.directive('appWhatsnewFeed', app.whatsnewFeedDirective);


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @param {!string} imageUrl URL to the image backend.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @extends {app.FeedController}
 * @ngInject
 */
app.WhatsnewFeedController = function($scope, appAuthentication, appApi, appLang, imageUrl, ngeoLocation) {

  goog.base(this, appAuthentication, appApi, appLang, imageUrl, ngeoLocation);

  /**
   * @type {number}
   * @export
   */
  this.userId;

  /**
   * @type {string}
   * @export
   */
  this.currentLang = appLang.getLang();
};
goog.inherits(app.WhatsnewFeedController, app.FeedController);

/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 * @override
 */
app.WhatsnewFeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  if (this.ngeoLocation.hasFragmentParam('u')) {
    this.userId = parseInt(this.ngeoLocation.getFragmentParam('u'), 10);
  }
  this.api.readWhatsnewFeed(this.nextToken, this.userId).then(function(response) {
    this.handleFeed(response);
  }.bind(this), function() { // Error msg is shown in the api service
    this.busy = false;
    this.error = true;
  }.bind(this));
};


/**
 * @param {appx.DocumentChange} doc
 * @returns {string}
 * @export
 */
app.WhatsnewFeedController.prototype.getVersionUrl = function(doc) {
  return '/{module}/version/{id}/{lang}/{version}'
    .replace('{module}', app.utils.getDoctype(doc.document.type))
    .replace('{id}', String(doc.document.document_id))
    .replace('{lang}', doc.lang)
    .replace('{version}', String(doc.version_id));
};


app.module.controller('appWhatsnewFeedController', app.WhatsnewFeedController);
