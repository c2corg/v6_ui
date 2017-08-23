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
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @param {!string} imageUrl URL to the image backend.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 * @struct
 */
app.FeedController = function($scope,appAuthentication, appApi, appLang, imageUrl, ngeoLocation) {

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
   * @type {number}
   * @private
   */
  this.nbCols_ = 0;

  /**
   * @type {boolean}
   * @public
   */
  this.hasAnnounce = false;

  /**
   * @type {Object}
   * @public
   */
  this.announce = {};

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
   * @type {Array<Object>}
   * @export
   */
  this.topics = [];

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
  this.busyForum = true;

  /**
   * @type {boolean}
   * @export
   */
  this.error = false;

  /**
   * @type {boolean}
   * @export
   */
  this.errorForum = false;

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
   * @type {boolean}
   * @export
   */
  this.showMobileBlock = /** @type {boolean} */ (JSON.parse(window.localStorage.getItem('showMobileBlock') || 'true'));

  /**
   * @type {boolean}
   * @export
   */
  this.showAssoBlock = /** @type {boolean} */ (JSON.parse(window.localStorage.getItem('showAssoBlock') || 'true'));



  /**
   * @type {ngeo.Location}
   * @public
   */
  this.ngeoLocation = ngeoLocation;

  this.getDocumentsFromFeed();
  this.getLatestTopics_();
  this.feedColumnManager();
  this.getAnnouncement_();
};


/**
 * init array for the column Manager
 * @private
 */
app.FeedController.prototype.getAnnouncement_ = function() {


  this.hasAnnounce = true;
  this.announce = {"title":"test titre","message": "test message"};


}

/**
 * toggle block above forum topics list
 @param number
 * @export
 */
app.FeedController.prototype.toggleBlock = function(id) {
  console.log("toogle: " +id)
  switch(id) {
    case 0:
 
      this.showAssoBlock = !this.showAssoBlock;
      window.localStorage.setItem('showAssoBlock', JSON.stringify(this.showAssoBlock));
      break;

    case 1:
        
      this.showMobileBlock = !this.showMobileBlock;
      window.localStorage.setItem('showMobileBlock', JSON.stringify(this.showMobileBlock));
      break;
  }


};

/**
 * init array for the column Manager
 * @private
 */
app.FeedController.prototype.initDocumentsCol_ = function() {
  if(this.documentsCol[0] == null) {
    this.documentsCol[0] = Array();
  }
  if(this.documentsCol[1] == null) {
    this.documentsCol[1] = Array();
  }
  if(this.documentsCol[2] == null) {
    this.documentsCol[2] = Array();
  }
}
/**
 * refresh the feed column according the width
 * @export
 */
app.FeedController.prototype.feedColumnManager = function() {

  $(window).resize(function() {

    if (window.innerWidth < 1400) {
      if(this.nbCols_ != 1) {
        this.documentsCol = Array();
        this.documentsCol[0] = this.documents;
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();

        this.nbCols_ = 1;
        this.scope_.$apply();
      }

    } else if(window.innerWidth >= 1400 && window.innerWidth < 2000) {


      if(this.nbCols_ != 2) {
        this.documentsCol = Array();
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 2;

        var height1 = 0;
        var height2 = 0;

        for(var i = 0,n = this.documents.length;i<n;i++) {

          console.log(height1 + " - " + height2 )
          if(height1 <= height2 ) {
            this.documentsCol[0].push(this.documents[i]);
            height1 = height1 + this.sizeEstimator(this.documents[i]);
          } else if(height2 <= height1) {
            this.documentsCol[1].push(this.documents[i]);
            height2 = height2 + this.sizeEstimator(this.documents[i]);
          } else {
            this.documentsCol[0].push(this.documents[i]);
            height1 = height1 + this.sizeEstimator(this.documents[i]);
          }


        }
        this.scope_.$apply();
      }  
    } else {
      if(this.nbCols_ != 3) {
        this.documentsCol = Array();
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 3;

        var height1 = 0;
        var height2 = 0;
        var height3 = 0;

        for(var i = 0,n = this.documents.length;i<n;i++) {
          console.log(height1 + " - " + height2 + " - " + height3 )
          if(height1 <= height2 && height1 <= height3) {
            this.documentsCol[0].push(this.documents[i]);
            height1 = height1 + this.sizeEstimator(this.documents[i]);
          } else if(height2 <= height1 && height2 <= height3) {
            this.documentsCol[1].push(this.documents[i]);
            height2 = height2 + this.sizeEstimator(this.documents[i]);
          } else if(height3 <= height2 && height3 <= height1) {
            this.documentsCol[2].push(this.documents[i]);
            height3 = height3 + this.sizeEstimator(this.documents[i]);
          } else {
            this.documentsCol[0].push(this.documents[i]);
            height1 = height1 + this.sizeEstimator(this.documents[i]);
          }


        }

        this.scope_.$apply();

      }
    }

  }.bind(this));
};


/**
 * Fills the feed with documents.
 * Used by ng-infinite-scroll directive in the template.
 * @export
 */
app.FeedController.prototype.getDocumentsFromFeed = function() {
  this.busy = true;
  this.api.readFeed(this.nextToken, this.lang_.getLang(), this.userId, this.isPersonal).then(function(response) {
    this.handleFeed(response);
  }.bind(this), function() { // Error msg is shown in the api service
    this.busy = false;
    this.error = true;
  }.bind(this));
};

/**
 * get latest topics
 * @private
 */
app.FeedController.prototype.getLatestTopics_ = function() {
  this.busyForum = true;
  this.api.readLatestForum().then(function(response) {
    this.handleForum(response);
  }.bind(this), function() { // Error msg is shown in the api service
    this.busyForum = false;
    this.errorForum = true;
  }.bind(this));
};


/**
 * number cannot be < 0 and cannot be decimal
 * @param number
 * @private
 */
app.FeedController.prototype.naturalNumber = function(n) {
  if(n < 0) {
    return 0;
  } else {
    if(n > 10) {
      return 10;
    }
    else {
      return Math.round(n);
    }
  }
}

/**
 * simulate size for a doc
 * @param Object
 @return {number}
 * @public
 */
app.FeedController.prototype.sizeEstimator= function(doc) {

  var size = 225;
  if(doc['document']['locales'][0]['summary'] !== null)
  {
    size = size + 22;
  }
  if(doc['document']['elevation_max'] !== null || doc['document']['height_diff_up'] !== null || doc['document']['height_diff_difficulties'] != null) {
    size = size +51
  }
  if(doc['image1'] != null)  {
    size = size +275;
  }
  if(doc['image2'] != null)  {
    size = size +100;
  }

  return size;

}
/**
 * Handles feed processing for Feed.js and Whatsnew.js
 * @param response
 * @public
 */
app.FeedController.prototype.handleFeed = function(response) {
  this.error = false;
  this.busy = false;
  var data = response['data']['feed'];
  var token = response['data']['pagination_token'];
  this.nextToken = token;

  this.initDocumentsCol_();
  console.log(window.innerWidth );
  if(window.innerWidth < 1400 ) {
    this.nbCols_ = 1;
    for (var k = 0; k < data.length; k++) {
      data[k]['type'] = "f";
      this.documentsCol[0].push(data[k]);
      this.documents.push(data[k]);
    }

  } else if (window.innerWidth >= 1400 && window.innerWidth < 2000) { 
    this.nbCols_ = 2;

    var element1 = angular.element(document.querySelector('.in-feed-col-1')); 
    var element2 = angular.element(document.querySelector('.in-feed-col-2'));

    var height1 = element1[0].offsetHeight;
    var height2 = element2[0].offsetHeight;

    for(var i = 0,n = data.length;i<n;i++) {
      data[i]['type'] = "f";

      if(height1 <= height2 ) {
        this.documentsCol[0].push(data[i]);
        height1 = height1 + this.sizeEstimator(data[i]);
      } else if(height2 <= height1) {
        this.documentsCol[1].push(data[i]);
        height2 = height2 + this.sizeEstimator(data[i]);
      } else {
        this.documentsCol[0].push(data[i]);
        height1 = height1 + this.sizeEstimator(data[i]);
      }

      this.documents.push(data[i]);

    }

  } else if(window.innerWidth >= 2000) {
    this.nbCols_ = 3;
    var element1 = angular.element(document.querySelector('.in-feed-col-1')); 
    var element2 = angular.element(document.querySelector('.in-feed-col-2'));
    var element3 = angular.element(document.querySelector('.in-feed-col-3')); 

    var height1 = element1[0].offsetHeight;
    var height2 = element2[0].offsetHeight;
    var height3 = element3[0].offsetHeight;


    for(var i = 0,n = data.length;i<n;i++) {
      data[i]['type'] = "f";


      if(height1 <= height2 && height1 <= height3) {
        this.documentsCol[0].push(data[i]);
        height1 = height1 + this.sizeEstimator(data[i]);
      } else if(height2 <= height1 && height2 <= height3) {
        this.documentsCol[1].push(data[i]);
        height2 = height2 + this.sizeEstimator(data[i]);
      } else if(height3 <= height2 && height3 <= height1) {
        this.documentsCol[2].push(data[i]);
        height3 = height3 + this.sizeEstimator(data[i]);
      } else {
        this.documentsCol[0].push(data[i]);
        height1 = height1 + this.sizeEstimator(data[i]);
      }

      this.documents.push(data[i]);

    }


  }

  if ((token && data.length === 0) || !token && this.documentsCol[0].length > 0) {
    this.feedEnd = true;
  } else if (data.length === 0) { // first fetch with no feed returned.
    this.noFeed = true;
  }
};

/**
 * Handles forum processing for Feed.js
 * @param response
 * @public
 */
app.FeedController.prototype.handleForum = function(response) {
  this.errorForum = false;
  this.busyForum = false;
  var data = response['data'];
  var postersAvatar = {};
  if (data['users'] !== undefined) {
    for (var j = 0; j < data['users'].length; j++) {
      postersAvatar[data['users'][j]['username']] = data['users'][j]['avatar_template'].replace('{size}','24');
    }

    for (var i = 0; i < data['topic_list']['topics'].length; i++) {
      data['topic_list']['topics'][i]['avatar_template'] = postersAvatar[data['topic_list']['topics'][i]['last_poster_username']];
      this.topics.push(data['topic_list']['topics'][i]);
      if (i == 15) {
        break;
      }
    }
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
