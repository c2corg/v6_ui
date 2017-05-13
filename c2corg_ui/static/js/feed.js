goog.provide('app.FeedController');
goog.provide('app.feedDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');
goog.require('app.utils');
goog.require('app.Url');

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
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 * @struct
 */
app.FeedController = function(appAuthentication, appApi, appLang, appUrl, imageUrl, ngeoLocation) {

  /**
   * @type {app.Api}
   * @public
   */
  this.api = appApi;

  /**
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

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
  this.nbCols = 0;

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documents = [];

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documentsL = [];

  /**
   * @type {Array<Object>}
   * @export
   */
  this.documentsR = [];

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
  this.getTopics();
  this.feedColumnManager();

};

/**
 * refresh the feed column according the width
 * @export
 */
app.FeedController.prototype.feedColumnManager = function() {


  $(window).resize(function() {

    if (window.innerWidth < 1360) {
      if (this.nbCols >= 2) {
        this.documentsR = Array();
        this.documentsL = this.documents;
        this.nbCols = 1;
      }
    } else {
      if (this.nbCols < 2) {
        this.documentsR = Array();
        this.documentsL = Array();

        for (var i = 0, n = this.documents.length; i < n; i++) {
          if (Math.floor(i / 5) % 2 == 0) {
            this.documentsL.push(this.documents[i]);
          } else {
            this.documentsR.push(this.documents[i]);
          }
        }
        this.nbCols = 2;
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
app.FeedController.prototype.getTopics = function() {
  this.busyForum = true;
  this.api.readForum().then(function(response) {
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
  if (window.innerWidth >= 1360) {
    this.nbCols = 2;

    for (var i = 0,n = data.length; i < n / 2; i++) {
      this.documentsL.push(data[i]);
      this.documents.push(data[i]);
    }
    for (var j = data.length / 2; j < data.length; j++) {
      this.documentsR.push(data[j]);
      this.documents.push(data[j]);
    }
  } else {
    this.nbCols = 1;
    for (var k = 0; k < data.length; k++) {
      this.documentsL.push(data[k]);
      this.documents.push(data[k]);
    }
  }

  if ((token && data.length === 0) || !token && this.documentsL.length > 0) {
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
 * @param {Object} doc
 * @return {string | undefined}
 * @export
 */
app.FeedController.prototype.createURL = function(doc) {

  var loc = window.location.pathname;
  // Don't create links on edit and add pages.

  if (loc.indexOf('/edit/') === -1 && loc.indexOf('/add') === -1) {
    return this.url_.buildDocumentUrl(
      app.utils.getDoctype(doc.document.type),  doc.document['document_id'],  doc.document['locales'][0]);
  }

};
/**
 * @param {Array} area
 * @return {string | undefined}
 * @export
 */
app.FeedController.prototype.createURLArea = function(area) {
  if (area !== undefined) {
    if (area.length > 0) {
      var loc = window.location.pathname;
      // Don't create links on edit and add pages.
      var doc = area[area.length - 1];
      if (loc.indexOf('/edit/') === -1 && loc.indexOf('/add') === -1) {
        return this.url_.buildDocumentUrl(
          app.utils.getDoctype(doc['type']),  doc['document_id'],  doc['locales'][0]);
      }
    }
  }

};

/**
 * @param {Object} doc
 * @export
 */
app.FeedController.prototype.openDoc = function(doc) {
  window.location = this.createURL(doc);
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
  this.documentsL = [];
  this.documentsR = [];
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
 * @param {string} rating1
 * @param {string} rating2
 * @return {string} rating
 */
app.FeedController.prototype.slashSeparatedRating_ = function(rating1, rating2) {
  var rating = rating1 ? rating1 + '' : '';
  rating += (rating1 && rating2) ? '/' : '';
  rating += rating2 ? rating2 + '' : '';

  return rating;
};


/**
 * Based on mako functions in helpers/view.html and route/detailed_route_attributes.html
 * @export
 * @param {Object} data
 * @return {Object} ratings
 */
app.FeedController.prototype.getFullRatings = function(data) {

  var ratings = {};
  var fullRatings = {};

  for (var p in data) {
    // every property that has 'rating' in it but with some exceptions.
    if (data.hasOwnProperty(p) &&
        (p.indexOf('rating') > -1 && p !== 'rock_free_rating' && p !== 'rock_required_rating' && p !== 'ski_rating'
         && p !== 'hiking_mtb_exposition' && p !== 'labande_global_rating' && p !== 'labande_ski_rating'
         && p !== 'mtb_up_rating' && p !== 'mtb_down_rating')) {
      ratings[p] = data[p];
    } else {

      if (data.hiking_mtb_exposition) {
        ratings['hiking_mtb_exposition'] = data.hiking_mtb_exposition;

      } else if (p === 'ski_rating' || p === 'ski_exposition') {
        ratings['ski_rating'] = this.slashSeparatedRating_(data.ski_rating, data.ski_exposition);

      } else if (p === 'labande_global_rating' || p === 'labande_ski_rating') {
        ratings['labande_rating'] = this.slashSeparatedRating_(data.labande_global_rating, data.labande_ski_rating);

      } else if (p === 'mtb_up_rating' || p === 'mtb_down_rating') {
        ratings['mtb_rating'] = this.slashSeparatedRating_(data.mtb_down_rating, data.hiking_mtb_exposition);

      } else if (p === 'rock_required_rating' || p === 'rock_free_rating') {
        ratings['rock_rating'] = data.rock_free_rating;

        if (data.rock_required_rating && data.rock_free_rating) {
          // [A0] (without bracket) is showed only if equipment_rating = P1 or P1+, and if aid_rating is empty.
          var A0 = (data.equipment_rating === 'P1' || data.equipment_rating === 'P1+') && !data.aid_rating;
          ratings['rock_rating'] += '>' + data.rock_required_rating;
          ratings['rock_rating'] += A0 ? '[A0]' : '';
        }
      }

    }
  }
  app.constants.fullRatingOrdered.forEach(function(rating) {
    if (rating in ratings && ratings[rating]) {
      fullRatings[rating] = ratings[rating];
    }
  });

  return fullRatings[Object.keys(fullRatings)[0]] ? fullRatings : null;
};


/**
 * Show only one of the area types, the first that is available:
 * 1) range 2) admin limits 3) country
 * @param {?Array<Object>} areas
 * @return {string | null}
 * @export
 */
app.FeedController.prototype.showArea = function(areas) {

  if (areas !== undefined) {

    // the areas often come in different orders within 3 area objects.
    var orderedAreas = {'range': [], 'admin_limits': [], 'country': []};
    var type;

    if (areas.length > 0) {
      type = areas[areas.length - 1]['area_type'];
      orderedAreas[type].push(areas[areas.length - 1]['locales'][0]['title']);
    }

    for (var t in orderedAreas) {
      if (orderedAreas[t].length) {
        return orderedAreas[t][orderedAreas[t].length - 1];
      }
    }

  }
  return null;
};


/**
 * Show title with the good language:
 * @param {?Array<Object>} locales
 * @return {string | null}
 * @export
 */
app.FeedController.prototype.showTitle = function(locales) {

  for (var i = 0; i < locales.length; i++) {
    if (locales.lang == this.lang_) {
      if (!locales[i].title_prefix) {
        return locales[i].title;
      } else {
        return locales[i].title_prefix  + ' : ' + locales[i].title;
      }
    }
  }

  if (!locales[0].title_prefix) {
    return locales[0].title;
  } else {
    return locales[0].title_prefix  + ' : ' + locales[0].title;
  }
};


/**
 * Show summaru with the good language:
 * 1) range 2) admin limits 3) country
 * @param {?Array<Object>} locales
 * @return {string | null}
 * @export
 */
app.FeedController.prototype.showSummary = function(locales) {

  for (var i = 0; i < locales.length; i++) {
    if (locales.lang == this.lang_) {
      if (locales[i].summary) {
        return locales[i].summary;
      }
    }
  }

  if (locales[0].summary) {
    return locales[0].summary;
  }

  return null;
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
