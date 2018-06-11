/**
 * @module app.Biodivsports
 */
import appBase from './index.js';

/**
 * Service for accessing the Biodiv'sports API.
 * @param {angular.$http} $http
 * @param {app.Lang} LangService Lang service.
 * @constructor
 * @struct
 * @ngInject
 */
const exports = function($http, LangService) {

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {app.Lang}
   * @private
   */
  this.langService_ = LangService;

  /**
   * @type {string}
   * @private
   */
  this.biodivsportsUrl_ = 'https://biodiv-sports.fr/api/v2/sensitivearea/';
};

/**
 * @param {ol.Extent} extent in WGS format
 * @param {Array.<string>|null} activities for filtering retrieved zones
 * @return {!angular.$http.HttpPromise}
 */
exports.prototype.fetchData = function(extent, activities = null) {
  // select language
  let language = this.langService_.getLang();
  if (language != 'fr' && language != 'en' && language != 'it') {
    language = 'fr';
  }

  const params = {
    'in_bbox': `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`,
    language,
    'fields': 'id,geometry,name,description,info_url,period,kml_url'
  };

  if (activities && activities.length > 0) {
    // select practices depending on activities
    const practices = [1, 2, 4]; // for anyone: Land, Vertical, Equipment
    if (activities.indexOf('paragliding') > 0) {
      practices.push(3); // Aérien
    }
    params['practices'] = practices.join(',');
  }
  return this.http_.get(this.biodivsportsUrl_, {params});
};


appBase.module.service('appBiodivsports', exports);


export default exports;
