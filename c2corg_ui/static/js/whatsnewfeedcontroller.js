/**
 * @module app.WhatsnewFeedController
 */
import appBase from './index.js';
import appUtils from './utils.js';
import olBase from 'ol.js';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Api} ApiService Api service.
 * @param {app.Lang} LangService Lang service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @extends {app.FeedController}
 * @ngInject
 */
const exports = function($scope, ApiService, LangService, ngeoLocation) {

  appBase.FeedController.call(this, $scope, ApiService, LangService, ngeoLocation);

  /**
   * @type {number}
   * @export
   */
  this.userId;

  /**
   * @type {string}
   * @export
   */
  this.currentLang = LangService.getLang();
};

olBase.inherits(exports, appBase.FeedController);

/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 * @override
 */
exports.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  if (this.ngeoLocation.hasFragmentParam('u')) {
    this.userId = parseInt(this.ngeoLocation.getFragmentParam('u'), 10);
  }
  this.api.readWhatsnewFeed(this.nextToken, this.userId).then((response) => {
    this.handleFeed(response);
  }, () => { // Error msg is shown in the api service
    this.busy = false;
    this.error = true;
  });
};


/**
 * @param {appx.DocumentChange} doc
 * @returns {string}
 * @export
 */
exports.prototype.getVersionUrl = function(doc) {
  return '/{module}/version/{id}/{lang}/{version}'
    .replace('{module}', appUtils.getDoctype(doc.document.type))
    .replace('{id}', String(doc.document.document_id))
    .replace('{lang}', doc.lang)
    .replace('{version}', String(doc.version_id));
};


appBase.module.controller('appWhatsnewFeedController', exports);


export default exports;
