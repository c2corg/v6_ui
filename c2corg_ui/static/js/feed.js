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
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 * @struct
 */
app.FeedController = function(appAuthentication, appApi, appLang, imageUrl, ngeoLocation) {

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
   * @type {ngeo.Location}
   * @public
   */
  this.ngeoLocation = ngeoLocation;

  this.getDocumentsFromFeed();
  this.getLatestTopics();
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
  if(this.documentsCol[1] == null) {
    this.documentsCol[1] = Array();
  }
}
/**
 * refresh the feed column according the width
 * @export
 */
app.FeedController.prototype.feedColumnManager = function() {


  $(window).resize(function() {

    if (window.innerWidth < 1360) {
      if (this.nbCols_ >= 2) {
        //this.documentsL = this.documents;
        this.documentsCol = Array();
        this.documentsCol[0] = this.documents;
        this.nbCols_ = 1;
      }
    } else {
      if (this.nbCols_ < 2) {
        this.documentsCol = Array();
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        
        //console.log(this.documents);

        for (var i = 0, n = this.documents.length; i < n; i++) {
          if (Math.floor(i / 5) % 2 == 0) {
            this.documentsCol[0].push(this.documents[i]);
          } else {
            this.documentsCol[1].push(this.documents[i]);
          }
        }
        
         //console.log(this.documentsCol);
        
        
        this.nbCols_ = 2;
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
app.FeedController.prototype.getLatestTopics = function() {
  this.busyForum = true;
  this.api.readLatestForum().then(function(response) {
    this.handleForum(response);
  }.bind(this), function() { // Error msg is shown in the api service
    this.busyForum = false;
    this.errorForum = true;
  }.bind(this));
};

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
  
  if (window.innerWidth >= 1360) {
    this.nbCols_ = 2;

    for (var i = 0,n = data.length; i < n / 2; i++) {
     
      data[i]['type'] = "f";
      this.documentsCol[0].push(data[i]);
      this.documents.push(data[i]);
    }
    for (var j = data.length / 2; j < data.length; j++) {
      data[j]['type'] = "f";
      this.documentsCol[1].push(data[j]);
      this.documents.push(data[j]);
    }
  } else {
    this.nbCols_ = 1;
    for (var k = 0; k < data.length; k++) {
      data[k]['type'] = "f";
      this.documentsCol[0].push(data[k]);
      this.documents.push(data[k]);
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
  return line + this.getDocumentType(doc['document']['type']);
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
