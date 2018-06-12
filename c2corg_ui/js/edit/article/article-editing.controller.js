import DocumentEditingController from '../document/document-editing.controller';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {Object} $uibModal modal from angular bootstrap.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Lang} LangService Lang service.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} appDocument
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the article backend.
 * @constructor
 * @extends {app.DocumentEditingController}
 * @ngInject
 */
export default class ArticleEditingController extends DocumentEditingController {
  constructor($scope, $element, $attrs, $http, $uibModal, $compile, LangService, appAuthentication, ngeoLocation,
    appAlerts, appApi, authUrl, appDocument, appUrl, imageUrl) {
    'ngInject';

    super($scope, $element, $attrs, $http, $uibModal, $compile, LangService, appAuthentication, ngeoLocation,
      appAlerts, appApi, authUrl, appDocument, appUrl, imageUrl);

    /**
     * @type {?string}
     * @export
     */
    this.initialArticleType = null;
  }

  /**
   * @param {appx.Document} data
   * @return {appx.Document}
   * @override
   * @public
   */
  filterData(data) {
    this.initialArticleType = data['article_type'];
    return data;
  }

  /**
   * @param {appx.Document} doc Document attributes.
   * @return {number}
   * @override
   */
  presetQuality(doc) {
    let score = 0;

    if ('summary' in doc.locales[0] && doc.locales[0]['summary']) {
      score++;
    }

    if (doc['associations']['waypoints'].length) {
      score++;
    }

    if (doc['associations']['images'].length) {
      score++;
    }

    if ('description' in doc.locales[0] && doc.locales[0]['description']) {
      score++;

      const pattern_title = /(^|\n)##/g; // regex for title
      const result_search_title = doc['locales'][0]['description'].search(pattern_title);
      if (result_search_title !== -1) {
        score++;
      }

      const pattern_img = /\[img=/g; // regex for image
      const result_search_img = doc['locales'][0]['description'].search(pattern_img);
      if (result_search_img !== -1) {
        score++;
      }

    } else {
      score = Math.min(score, 1);
    }

    score = Math.min(score, 4);
    return score;
  }
}
