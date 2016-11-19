goog.provide('app.CardController');
goog.provide('app.cardDirective');

goog.require('app');
goog.require('app.utils');
goog.require('app.Url');


/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cardDirective = function($compile, $templateCache) {
  var cardElementCache = {};

  var getCardElement = function(doctype) {
    if (cardElementCache[doctype] !== undefined) {
      return cardElementCache[doctype];
    }
    var path = '/static/partials/cards/' + doctype + '.html';
    var template = app.utils.getTemplate(path, $templateCache);

    var element = angular.element(template);
    cardElementCache[doctype] = $compile(element);

    return cardElementCache[doctype];
  };

  return {
    restrict: 'E',
    controller: 'AppCardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '=appCardDoc'
    },
    link: function(scope, element, attrs, ctrl) {
      var cardElementFn = getCardElement(ctrl.type);
      cardElementFn(scope, function(clone) {
        element.append(clone);
      });
    }
  };
};


app.module.directive('appCard', app.cardDirective);


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.CardController = function(gettextCatalog, appUrl, imageUrl) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

  /**
   * @type {string}
   * @private
   */
  this.imageUrl_ = imageUrl;

  /**
   * @type {string}
   * @export
   */
  this.lang = gettextCatalog.currentLanguage;

  /**
   * @type {appx.Document}
   * @export
   */
  this.doc;

  /**
   * @type {string}
   * @public
   */
  this.type = app.utils.getDoctype(this.doc['type']);

  /**
   * @type {Object}
   * @export
   */
  this.locale = this.doc.locales[0];
  for (var i = 0, n = this.doc.locales.length; i < n; i++) {
    var l = this.doc.locales[i];
    if (l['lang'] === this.lang) {
      this.locale = l;
      break;
    }
  }
};


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
app.CardController.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * Creates a link to the document view-page
 * @export
 * @return {string | undefined}
 */
app.CardController.prototype.createURL = function() {
  var loc = window.location.pathname;
  // Don't create links on edit and add pages.
  if (loc.indexOf('edit') === -1 && loc.indexOf('add') === -1) {
    return this.url_.buildDocumentUrl(
      this.type, this.doc['document_id'], this.doc['locales'][0]);
  }
};


/**
 * Don't create any url on edit and add pages.
 * @export
 * @param {string} suffix (BI, SI, MI)
 * @return {string}
 */
app.CardController.prototype.createImg = function(suffix) {
  return this.imageUrl_ + app.utils.createImageUrl(this.doc['filename'], 'MI');
};

/**
 * Gets the global ratings for each activity of a route.
 * @export
 * @return {Object | null} ratings
 */
app.CardController.prototype.getGlobalRatings = function() {
  var doc = this.doc;
  var ratings = {};

  doc.activities.forEach(function(a) {
    if (a === 'rock_climbing' || a === 'mountain_climbing' || a === 'snow_ice_mixed') {
      ratings['global_rating'] = doc.global_rating;

    } else if (a === 'via_ferrata') {
      ratings['via_ferrata_rating'] = doc.via_ferrata_rating;

    } else if (a === 'snowshoeing') {
      ratings['snowshoe_rating'] = doc.snowshoe_rating;

    } else if (a === 'hiking') {
      ratings['hiking_rating'] = doc.hiking_rating;

    } else if (a === 'ice_climbing') {
      ratings['ice_rating'] = this.slashSeparatedRating_(doc.ice_rating, doc.engagement_rating);

    } else if (a === 'skitouring') {
      ratings['labande_global_rating'] = this.slashSeparatedRating_(doc.ski_rating, doc.ski_exposition);
      ratings['labande_global_rating'] += doc.labande_global_rating ? doc.labande_global_rating : '';

    } else if (a === 'mountain_biking') {
      ratings['biking_rating'] = this.slashSeparatedRating_(doc.mtb_down_rating, doc.hiking_mtb_exposition);
    }
  }.bind(this));

  ratings = Object.keys(ratings)[0] ? ratings : null;
  return ratings;
};


/**
 * Based on mako functions in helpers/view.html and route/detailed_route_attributes.html
 * @export
 * @return {Object} ratings
 */
app.CardController.prototype.getFullRatings = function() {
  var doc = this.doc;
  var ratings = {};
  var fullRatings = {};

  for (var p in doc) {
    // every property that has 'rating' in it but with some exceptions.
    if (doc.hasOwnProperty(p) &&
      (p.indexOf('rating') > -1 && p !== 'rock_free_rating' && p !== 'rock_required_rating' && p !== 'ski_rating'
        && p !== 'hiking_mtb_exposition' && p !== 'labande_global_rating' && p !== 'labande_ski_rating'
        && p !== 'mtb_up_rating' && p !== 'mtb_down_rating')) {
      ratings[p] = doc[p];
    } else {
      if (doc.hiking_mtb_exposition) {
        ratings['hiking_mtb_exposition'] = doc.hiking_mtb_exposition;

      } else if (p === 'ski_rating' || p === 'ski_exposition') {
        ratings['ski_rating'] = this.slashSeparatedRating_(doc.ski_rating, doc.ski_exposition);

      } else if (p === 'labande_global_rating' || p === 'labande_ski_rating') {
        ratings['labande_rating'] = this.slashSeparatedRating_(doc.labande_global_rating, doc.labande_ski_rating);

      } else if (p === 'mtb_up_rating' || p === 'mtb_down_rating') {
        ratings['mtb_rating'] = this.slashSeparatedRating_(doc.mtb_down_rating, doc.hiking_mtb_exposition);

      } else if (p === 'rock_required_rating' || p === 'rock_free_rating') {
        ratings['rock_rating'] = doc.rock_free_rating;

        if (doc.rock_required_rating && doc.rock_free_rating) {
          // [A0] (without bracket) is showed only if equipment_rating = P1 or P1+, and if aid_rating is empty.
          var A0 = (doc.equipment_rating === 'P1' || doc.equipment_rating === 'P1+') && !doc.aid_rating;
          ratings['rock_rating'] += '>' + doc.rock_required_rating;
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
  return fullRatings;
};

/**
 * @param {string} rating1
 * @param {string} rating2
 * @return {string} rating
 */
app.CardController.prototype.slashSeparatedRating_ = function(rating1, rating2) {
  var rating = rating1 ? rating1 + '' : '';
  rating += (rating1 && rating2) ? '/' : '';
  rating += rating2 ? rating2 + '' : '';

  return rating;
};

app.module.controller('AppCardController', app.CardController);
