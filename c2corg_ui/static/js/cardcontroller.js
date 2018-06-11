/**
 * @module app.CardController
 */
import appBase from './index.js';
import appUtils from './utils.js';

/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @struct
 * @ngInject
 */
const exports = function(gettextCatalog, appUrl, imageUrl, moment) {

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
   * @type {boolean}
   * @export
   */
  this.remainingActivities = false;

  /**
   * @type {string}
   * @public
   */
  this.type = appUtils.getDoctype(this.doc['type']);

  /**
   * FIXME: find type declaration for MomentJs
   * @private
   */
  this.moment_ = moment;

  /**
   * @type {Object}
   * @export
   */
  this.locale = {};

  const locales = this.type === 'feeds' ? this.doc.document.locales : this.doc.locales;

  this.locale = locales[0];
  for (let i = 0, n = locales.length; i < n; i++) {
    const l = locales[i];
    if (l['lang'] === this.lang) {
      this.locale = l;
      break;
    }
  }
};


/**
 * Will be useful for verbs like 'created', 'updated', 'associated xx', 'went hiking with xx'.
 * @return {string} line
 * @export
 */
exports.prototype.createActionLine = function() {
  let line = '';

  switch (this.doc['change_type']) {
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
  return line + this.getDocumentType(this.doc['document']['type']);
};

/**
 * document type without 's' (singular form)
 * @export
 * @returns {string}
 */
exports.prototype.getDocumentType = function(type) {
  return appUtils.getDoctype(type).slice(0, -1);
};

/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
exports.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * Show only one of the area types, the first that is available:
 * 1) range 2) admin limits 3) country
 * @param {?Array<Object>} areas
 * @return {string}
 * @export
 */
exports.prototype.showArea = function(areas) {
  if (areas) {
    // the areas often come in different orders within 3 area objects.
    const orderedAreas = {'range': [], 'admin_limits': [], 'country': []};
    let type;
    for (let i = 0; i < areas.length; i++) {
      type = areas[i]['area_type'];
      orderedAreas[type].push(areas[i]['locales'][0]['title']);
    }
    let sortedAreas = [];
    if (orderedAreas['range'].length) {
      sortedAreas = sortedAreas.concat(orderedAreas['range']);
    }
    if (orderedAreas['admin_limits'].length) {
      sortedAreas = sortedAreas.concat(orderedAreas['admin_limits']);
    }
    if (orderedAreas['country'].length) {
      sortedAreas = sortedAreas.concat(orderedAreas['country']);
    }
    return sortedAreas.join(' - ');
  }
  return '';
};


/**
 * Convert orientations array into a string
 * @param {?Array<string>} orientations
 * @return {string}
 * @export
 */
exports.prototype.showOrientation = function(orientations) {
  return orientations.join(', ');
};


/**
 * @return {string}
 * @export
 */
exports.prototype.showDates = function() {
  const start = this.doc['document']['date_start'];
  const end = this.doc['document']['date_end'];
  const sameYear = this.moment_(start).year() == this.moment_(end).year();
  const sameMonth = this.moment_(start).month() == this.moment_(end).month();
  const sameDay = this.moment_(start).date() == this.moment_(end).date();
  if (sameDay && sameMonth && sameYear) {
    return this.moment_(end).format('Do MMMM YYYY');
  }
  if (sameYear) {
    if (sameMonth) {
      return this.moment_(start).format('Do') + ' - ' + this.moment_(end).format('Do MMMM YYYY');
    }
    return this.moment_(start).format('Do MMMM') + ' - ' + this.moment_(end).format('Do MMMM YYYY');
  }
  return this.moment_(start).format('Do MMMM YYYY') + ' - ' + this.moment_(end).format('Do MMMM YYYY');
};


/**
 * Create redirection to the document page
 * @export
 */
exports.prototype.openDoc = function() {
  window.location = this.createURL();
};


/**
 * Creates a link to the document view-page
 * @export
 * @return {string | undefined}
 */
exports.prototype.createURL = function() {
  let type, doc;
  if (this.type == 'feeds') {
    type = appUtils.getDoctype(this.doc['document']['type']);
    doc = this.doc['document'];
  } else {
    type = this.type;
    doc = this.doc;
  }
  return this.url_.buildDocumentUrl(type, doc['document_id'], doc['locales'][0]);
};


/**
 * @param {string} filename
 * @param {string} suffix
 * @return {string}
 * @export
 */
exports.prototype.createImageUrl = function(filename, suffix) {
  return this.imageUrl_ + appUtils.createImageUrl(filename, suffix);
};


/**
 * @param {Array} areas
 * @return {string | undefined}
 * @export
 */
exports.prototype.createAreaURL = function(areas) {
  const loc = window.location.pathname;
  if (areas && areas.length &&
      loc.indexOf('/edit/') === -1 && loc.indexOf('/add') === -1) {

    const orderedAreas = {'range': [], 'admin_limits': [], 'country': []};
    for (let i = 0, type; i < areas.length; i++) {
      type = areas[i]['area_type'];
      orderedAreas[type].push(areas[i]);
    }

    let doc;
    if (orderedAreas['range'].length) {
      doc = orderedAreas['range'][0];
    } else if (orderedAreas['admin_limits'].length) {
      doc = orderedAreas['admin_limits'][0];
    } else {
      doc = orderedAreas['country'][0];
    }

    return this.url_.buildDocumentUrl(
      appUtils.getDoctype(doc['type']),
      doc['document_id'],
      doc['locales'][0]
    );
  }
};


/**
 * Don't create any url on edit and add pages.
 * @export
 * @param {string} suffix (BI, SI, MI)
 * @return {string}
 */
exports.prototype.createImg = function(suffix) {
  return this.imageUrl_ + appUtils.createImageUrl(this.doc['filename'], 'MI');
};


/**
 * Gets the global ratings for each activity of a route.
 * @export
 * @return {Object | null} ratings
 */
exports.prototype.getGlobalRatings = function() {
  const doc = this.doc;
  const ratings = {};

  doc.activities.forEach((a) => {
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
  });
  return ratings[Object.keys(ratings)[0]] ? ratings : null;
};


/**
 * Based on mako functions in helpers/view.html and route/detailed_route_attributes.html
 * @export
 * @return {Object} ratings
 */
exports.prototype.getFullRatings = function() {
  const doc = this.type == 'feeds' ? this.doc['document'] : this.doc;
  const ratings = {};
  const fullRatings = {};

  for (const p in doc) {
    // every property that has 'rating' in it but with some exceptions.
    if (doc.hasOwnProperty(p) && p.indexOf('rating') > -1 &&
        p !== 'rock_free_rating' && p !== 'rock_required_rating' && p !== 'ski_rating' &&
        p !== 'labande_global_rating' && p !== 'labande_ski_rating') {
      ratings[p] = doc[p];
    } else {
      ratings[p] = doc[p];
      if (p === 'hiking_mtb_exposition') {
        ratings['hiking_mtb_exposition'] = doc.hiking_mtb_exposition;

      } else if (p === 'ski_rating' || p === 'ski_exposition') {
        ratings['ski_rating'] = this.slashSeparatedRating_(doc.ski_rating, doc.ski_exposition);

      } else if (p === 'labande_global_rating' || p === 'labande_ski_rating') {
        ratings['labande_rating'] = this.slashSeparatedRating_(doc.labande_global_rating, doc.labande_ski_rating);

      } else if (p === 'rock_required_rating' || p === 'rock_free_rating') {
        ratings['rock_rating'] = doc.rock_free_rating;

        if (doc.rock_required_rating && doc.rock_free_rating) {
          // [A0] (without bracket) is showed only if equipment_rating = P1 or P1+, and if aid_rating is empty.
          const A0 = (doc.equipment_rating === 'P1' || doc.equipment_rating === 'P1+') && !doc.aid_rating;
          ratings['rock_rating'] += '>' + doc.rock_required_rating;
          ratings['rock_rating'] += A0 ? '[A0]' : '';
        }
      }
    }
  }
  appBase.constants.fullRatingOrdered.forEach((rating) => {
    if (rating in ratings && ratings[rating]) {
      fullRatings[rating] = ratings[rating];
    }
  });

  return fullRatings[Object.keys(fullRatings)[0]] ? fullRatings : null;
};


/**
 * @param {string|null} rating1
 * @param {string|null} rating2
 * @return {string|null} rating
 */
exports.prototype.slashSeparatedRating_ = function(rating1, rating2) {
  let rating = rating1 || '';
  rating += (rating1 && rating2) ? '/' : '';
  rating += rating2 || '';
  return rating;
};


/**
 * @export
 */
exports.prototype.hasActivity = function(activities) {
  return (this.type === 'routes') ?
    appUtils.hasActivity(/** @type{appx.Route}*/ (this.doc), activities) : false;
};

appBase.module.controller('AppCardController', exports);


export default exports;
