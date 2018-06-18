import FeedController from '../feed/feed.controller';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Api} ApiService Api service.
 * @param {app.Lang} LangService Lang service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @extends {app.FeedController}
 * @ngInject
 */
export default class WhatsnewFeedController extends FeedController {
  constructor($scope, ApiService, LangService, ngeoLocation, UtilsService) {
    'ngInject';

    super($scope, ApiService, LangService, ngeoLocation);

    this.utilsService_ = UtilsService;

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
  }

  /**
   * Fills the feed with documents.
   * Used by ng-infinite-scroll directive in the template.
   * @export
   * @override
   */
  getDocumentsFromFeed() {
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
  }


  /**
   * @param {appx.DocumentChange} doc
   * @returns {string}
   * @export
   */
  getVersionUrl(doc) {
    return '/{module}/version/{id}/{lang}/{version}'
      .replace('{module}', this.utilsService_.getDoctype(doc.document.type))
      .replace('{id}', String(doc.document.document_id))
      .replace('{lang}', doc.lang)
      .replace('{version}', String(doc.version_id));
  }
}
