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

    console.log("on resize")
    if (window.innerWidth < 1600) {
      if(this.nbCols_ > 1) {
        this.documentsCol = Array();
        this.documentsCol[0] = this.documents;
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
      
        this.nbCols_ = 1;
      }

    } else if(window.innerWidth >= 1600 && window.innerWidth < 2000) {

     
      if(this.nbCols_ != 2) {
        this.documentsCol = Array();
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 2;
        for(var i = 0;i<this.documents.length;i++)
        {

          if (Math.floor(i / 5) % 2 == 0) {
            this.documentsCol[0].push(this.documents[i]);
          } else {
            this.documentsCol[1].push(this.documents[i]);
          }

        }


      }
    } else {
      if(this.nbCols_ != 3) {


        this.documentsCol = Array();
        this.documentsCol[0] = Array();
        this.documentsCol[1] = Array();
        this.documentsCol[2] = Array();
        this.nbCols_ = 3;
        for(var i = 0;i<this.documents.length;i++)
        {

          if (Math.floor(i / 3) % 3 == 0) {
            this.documentsCol[0].push(this.documents[i]);
          } else if (Math.floor(i / 3) % 3 == 1) {
            this.documentsCol[1].push(this.documents[i]);
          }  else {
            this.documentsCol[2].push(this.documents[i]);
          }
        }
      }

    }
    /*
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
    */
     this.scope_.$apply();
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
  if(this.documentsCol[0].length == 0) {
    if (window.innerWidth >= 1600 && window.innerWidth < 2000) {
      this.nbCols_ = 2;

      for (var i = 0,n = data.length/2; i < n; i++) {

        data[i]['type'] = "f";
        this.documentsCol[0].push(data[i]);
        this.documents.push(data[i]);
      }
      for (var j = data.length / 2; j < data.length; j++) {
        data[j]['type'] = "f";
        this.documentsCol[1].push(data[j]);
        this.documents.push(data[j]);
      }
    } else if (window.innerWidth >= 2000) {
      this.nbCols_ = 3;

      for (var i = 0, n = Math.round(data.length/3); i < n; i++) {
        console.log("on ajoute dans col 1")
        data[i]['type'] = "f";
        this.documentsCol[0].push(data[i]);
        this.documents.push(data[i]);
      }
      for (var j = Math.round(data.length / 3),  o = Math.round(data.length*2/3); j < o; j++) {
        console.log("on ajoute dans col 2")
        data[j]['type'] = "f";
        this.documentsCol[1].push(data[j]);
        this.documents.push(data[j]);
      }

      for (var k = Math.round(data.length*2 / 3); k < data.length; k++) {
        console.log("on ajoute dans col 3")
        data[k]['type'] = "f";
        this.documentsCol[2].push(data[k]);
        this.documents.push(data[k]);
      }

    }

    else {
      this.nbCols_ = 1;
      for (var k = 0; k < data.length; k++) {
        data[k]['type'] = "f";
        this.documentsCol[0].push(data[k]);
        this.documents.push(data[k]);
      }
    }
  } else {
    if(this.nbCols_ == 1) {
      for (var k = 0; k < data.length; k++) {
        data[k]['type'] = "f";
        this.documentsCol[0].push(data[k]);
        this.documents.push(data[k]);
      }
    } else {
      var element1 = angular.element(document.querySelector('.in-feed-col-1')); 
      var element2 = angular.element(document.querySelector('.in-feed-col-2'));
      var element3 = angular.element(document.querySelector('.in-feed-col-3')); 

      var height1 = element1[0].offsetHeight;
      var height2 = element2[0].offsetHeight;
      var height3 = element3[0].offsetHeight;

      var bonus1 = 0;
      var bonus2 = 0;
      var bonus3 = 0;


      if (window.innerWidth >= 1600 && window.innerWidth < 2000) {
        this.nbCols_ = 2;


        if(height1 > height2 && height1 > height3) {

          bonus2 = Math.round((height1 - height2) / 479);
          bonus1 =  -1*bonus2;

        } else if(height2 > height1 && height2 > height3) {

          bonus1 = Math.round((height2 - height1) / 479);
          bonus2 = -1*bonus1;
        } 


        for (var i = 0,n = this.naturalNumber((data.length/2)+bonus1); i < n ; i++) {

          data[i]['type'] = "f";
          this.documentsCol[0].push(data[i]);
          this.documents.push(data[i]);
        }
        for (var j = this.naturalNumber((data.length/2)+bonus1); j < data.length; j++) {
          data[j]['type'] = "f";
          this.documentsCol[1].push(data[j]);
          this.documents.push(data[j]);
        }
      } else if (window.innerWidth >= 2000) {
        this.nbCols_ = 3;

        if(height1 > height2 && height1 > height3) {

          bonus2 = Math.round((height1 - height2) / 479);
          bonus3 = Math.round((height1 - height3) / 479);
          bonus1 =  -1*bonus2 - bonus3;

        } else if(height2 > height1 && height2 > height3) {

          bonus1 = Math.round((height2 - height1) / 479);
          bonus3 = Math.round((height2 - height3) / 479);
          bonus2 = -1*bonus1 - bonus3;

        } else if(height3 > height1 && height3 > height2) {

          bonus1 = Math.round((height3 - height1) / 479);
          bonus2 = Math.round((height3 - height2) / 479);
          bonus3 = -1*bonus1 - bonus3;
        }


        for (var i = 0, n = this.naturalNumber((data.length/3)+bonus1); i < n; i++) {

          data[i]['type'] = "f";
          this.documentsCol[0].push(data[i]);
          this.documents.push(data[i]);
        }

        for (var j = this.naturalNumber((data.length / 3)+bonus1),  o = this.naturalNumber((data.length*2/3)+bonus2); j < o; j++) {

          data[j]['type'] = "f";
          this.documentsCol[1].push(data[j]);
          this.documents.push(data[j]);
        }

        for (var k = this.naturalNumber((data.length*2 / 3)+bonus2); k < data.length; k++) {

          data[k]['type'] = "f";
          this.documentsCol[2].push(data[k]);
          this.documents.push(data[k]);
        }

      }

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
/*
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
*/

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
