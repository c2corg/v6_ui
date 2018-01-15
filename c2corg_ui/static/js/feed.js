goog.provide('app.FeedController');
goog.provide('app.feedDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.utils');


/**
 * @return {angular.Directive} The directive specs.
 */
app.feedDirective = function() {
  return {
    restrict: 'E',
    controller: 'appFeedController',
    controllerAs: 'feedCtrl',
    bindToController: {
      'userId': '=appFeedProfile'
    },
    templateUrl: '/static/partials/feed.html'
  };
};
app.module.directive('appFeed', app.feedDirective);


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 * @struct
 */
app.FeedController = function($scope, appApi, appLang, ngeoLocation) {

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {app.Api}
   * @public
   */
  this.api = appApi;

  /**
   * @type {app.Lang}
   * @private
   */
  this.lang_ = appLang;

  /**
   * @type {number}
   * @private
   */
  this.nbCols_ = 0;

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documents = [];

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documentsCol = [];

  /**
   * @type {string | undefined}
   * @public
   */
  this.nextToken;

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
   * @type {number}
   * @export
   */
  this.userId;

  /**
   * @type {boolean}
   * @export
   */
  this.isPersonal = !this.userId;

  /**
   * @type {ngeo.Location}
   * @public
   */
  this.ngeoLocation = ngeoLocation;

  this.initFeedColumnManager_();
  this.getDocumentsFromFeed();
};

/**
 * init array for the column Manager
 * @private
 */
app.FeedController.prototype.initDocumentsCol_ = function() {
  if (!this.documentsCol[0]) {
    this.documentsCol[0] = Array();
  }
  if (!this.documentsCol[1]) {
    this.documentsCol[1] = Array();
  }
  if (!this.documentsCol[2]) {
    this.documentsCol[2] = Array();
  }
};

/**
 * Refresh the feed columns according to the available screen width
 * @private
 */
app.FeedController.prototype.initFeedColumnManager_ = function() {

  $(window).resize(() => {

    if (window.innerWidth < 1400) {
      if (this.nbCols_ != 1) {
        this.documentsCol[0] = this.documents;
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();

        this.nbCols_ = 1;
        this.scope_.$apply();
      }

    } else if (window.innerWidth >= 1400 && window.innerWidth < 2000) {
      if (this.nbCols_ != 2) {
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 2;

        let height1_c2 = 0;
        let height2_c2 = 0;

        for (let i = 0, n = this.documents.length; i < n; i++) {

          if (height1_c2 <= height2_c2) {
            this.documentsCol[0].push(this.documents[i]);
            height1_c2 += this.estimateSize(this.documents[i]);
          } else if (height2_c2 < height1_c2) {
            this.documentsCol[1].push(this.documents[i]);
            height2_c2 += this.estimateSize(this.documents[i]);
          } else {
            this.documentsCol[0].push(this.documents[i]);
            height1_c2 += this.estimateSize(this.documents[i]);
          }

        }
        this.scope_.$apply();
      }
    } else {
      if (this.nbCols_ != 3) {
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 3;

        let height1_c3 = 0;
        let height2_c3 = 0;
        let height3_c3 = 0;

        for (let j = 0, o = this.documents.length; j < o; j++) {
          if (height1_c3 <= height2_c3 && height1_c3 <= height3_c3) {
            this.documentsCol[0].push(this.documents[j]);
            height1_c3 += this.estimateSize(this.documents[j]);
          } else if (height2_c3 <= height1_c3 && height2_c3 <= height3_c3) {
            this.documentsCol[1].push(this.documents[j]);
            height2_c3 += this.estimateSize(this.documents[j]);
          } else if (height3_c3 <= height2_c3 && height3_c3 <= height1_c3) {
            this.documentsCol[2].push(this.documents[j]);
            height3_c3 += this.estimateSize(this.documents[j]);
          } else {
            this.documentsCol[0].push(this.documents[j]);
            height1_c3 += this.estimateSize(this.documents[j]);
          }
        }

        this.scope_.$apply();
      }
    }

  });
};

/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 */
app.FeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  this.api.readFeed(this.nextToken, this.lang_.getLang(), this.userId, this.isPersonal).then((response) => {
    this.busy = false;
    this.handleFeed(response);
  }, () => { // Error msg is shown in the api service
    this.busy = false;
    this.error = true;
  });
};

/**
 * simulate size for a doc
 * @param {Object} doc
 * @return {number}
 * @public
 */
app.FeedController.prototype.estimateSize = function(doc) {
  let size = 225;
  if (doc['document']['locales'][0]['summary'] !== null) {
    size += 22;
  }
  if (doc['document']['elevation_max'] !== null || doc['document']['height_diff_up'] !== null || doc['document']['height_diff_difficulties'] !== null) {
    size += 51;
  }
  if (doc['image1'] !== null)  {
    size += 275;
  }
  if (doc['image2'] !== null)  {
    size += 100;
  }
  return size;
};

/**
 * Handles feed processing for Feed.js and Whatsnew.js
 * the next post is add on the column with the littlest height according the height of the column and the estimation about the height of the new post
 * @param response
 * @public
 */
app.FeedController.prototype.handleFeed = function(response) {
  this.error = false;
  this.busy = false;
  const data = response['data']['feed'];
  const token = response['data']['pagination_token'];
  this.nextToken = token;
  const whatsnew = angular.element(document.querySelector('app-whatsnew-feed'));

  this.initDocumentsCol_();
  if (window.innerWidth < 1400 || whatsnew.length > 0) {
    this.nbCols_ = 1;
    for (let k = 0, n = data.length; k < n; k++) {
      data[k]['type'] = 'f';
      this.documentsCol[0].push(data[k]);
      this.documents.push(data[k]);
    }

  } else if (window.innerWidth >= 1400 && window.innerWidth < 2000) {
    this.nbCols_ = 2;

    const element1_c2 = angular.element(document.querySelector('.in-feed-col-1'));
    const element2_c2 = angular.element(document.querySelector('.in-feed-col-2'));

    let height1_c2 = element1_c2[0].offsetHeight;
    let height2_c2 = element2_c2[0].offsetHeight;

    for (let i = 0, o = data.length; i < o; i++) {
      data[i]['type'] = 'f';

      if (height1_c2 <= height2_c2) {
        this.documentsCol[0].push(data[i]);
        height1_c2 = height1_c2 + this.estimateSize(data[i]);
      } else if (height2_c2 <= height1_c2) {
        this.documentsCol[1].push(data[i]);
        height2_c2 = height2_c2 + this.estimateSize(data[i]);
      } else {
        this.documentsCol[0].push(data[i]);
        height1_c2 = height1_c2 + this.estimateSize(data[i]);
      }

      this.documents.push(data[i]);
    }

  } else if (window.innerWidth >= 2000) {
    this.nbCols_ = 3;
    const element1 = angular.element(document.querySelector('.in-feed-col-1'));
    const element2 = angular.element(document.querySelector('.in-feed-col-2'));
    const element3 = angular.element(document.querySelector('.in-feed-col-3'));

    let height1_c3 = element1[0].offsetHeight;
    let height2_c3 = element2[0].offsetHeight;
    let height3_c3 = element3[0].offsetHeight;

    for (let j = 0, q = data.length; j < q; j++) {
      data[j]['type'] = 'f';

      if (height1_c3 <= height2_c3 && height1_c3 <= height3_c3) {
        this.documentsCol[0].push(data[j]);
        height1_c3 = height1_c3 + this.estimateSize(data[j]);
      } else if (height2_c3 <= height1_c3 && height2_c3 <= height3_c3) {
        this.documentsCol[1].push(data[j]);
        height2_c3 = height2_c3 + this.estimateSize(data[j]);
      } else if (height3_c3 <= height2_c3 && height3_c3 <= height1_c3) {
        this.documentsCol[2].push(data[j]);
        height3_c3 = height3_c3 + this.estimateSize(data[j]);
      } else {
        this.documentsCol[0].push(data[j]);
        height1_c3 = height1_c3 + this.estimateSize(data[j]);
      }

      this.documents.push(data[j]);
    }
  }

  if ((token && data.length === 0) || !token && this.documentsCol[0].length > 0) {
    this.feedEnd = true;
  } else if (data.length === 0) { // first fetch with no feed returned.
    this.noFeed = true;
  }
};

/**
 * Switches between /personal-feed and /feed
 * @export
 */
app.FeedController.prototype.toggleFilters = function() {
  this.isPersonal = !this.isPersonal;
  this.nextToken = undefined;
  this.documents = [];
  this.documentsCol = [];
  this.initFeedColumnManager_();
  this.getDocumentsFromFeed();
  window.scrollTo(0, 0);
};

/**
 * document type without 's' (singular form)
 * @export
 * @returns {string}
 */
app.FeedController.prototype.getDocumentType = function(type) {
  return app.utils.getDoctype(type).slice(0, -1);
};

app.module.controller('appFeedController', app.FeedController);
