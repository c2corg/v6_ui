goog.provide('app.AdvancedSearchController');

goog.require('app');
goog.require('app.utils');
goog.require('ol.Feature');
goog.require('ol.format.GeoJSON');


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {app.Api} appApi Api service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {angular.$q} $q Angular promises/deferred service.
 * @constructor
 * @struct
 * @ngInject
 */
app.AdvancedSearchController = function($scope, appApi, ngeoLocation,
  gettextCatalog, $q) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$q}
   * @private
   */
  this.$q_ = $q;

  /**
   * @type {string}
   * @export
   */
  this.doctype;

  /**
   * @type {boolean}
   * @export
   */
  this.useMap;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {number}
   * @export
   */
  this.total = 0;

  /**
   * @type {Array.<Object>}
   * @export
   */
  this.documents = [];

  /**
   * @type {boolean}
   * @export
   */
  this.noResults = false;

  /**
   * @type {?number}
   * @export
   */
  this.highlightId = null;

  /**
   * Promise to cancel the current XHR request.
   * @type {angular.$q.Deferred}
   * @private
   */
  this.canceler_ = null;

  /**
   * @type {boolean}
   * @private
   *
   * Recenter the map if no bbox filter is provided AND
   * a document id is provided
   */
  this.recenter_ = !this.location_.hasFragmentParam('bbox') &&
    app.utils.detectDocumentIdFilter(this.location_);

  // Refresh the results when pagination or criterias have changed:
  this.scope_.$root.$on('searchFilterChange', (event, loadPrefs) => {
    this.recenter_ = loadPrefs || this.recenter_;
    this.getResults_();
  });

  // Get the initial results when loading the page unless a map is used.
  // In that case wait to get the map extent before triggering the request.
  if (!this.useMap || this.recenter_) {
    this.getResults_();
  }

  if (this.useMap) {
    // Highlight matching cards when a map feature is hovered
    this.scope_.$root.$on('mapFeatureHover', (event, id) => {
      this.onMapFeatureHover_(id);
    });
  }
};


/**
 * @private
 */
app.AdvancedSearchController.prototype.getResults_ = function() {
  if (this.canceler_ !== null) {
    // cancel previous requests
    this.canceler_.resolve();
  }

  const url = this.location_.getUriString();
  let qstr = app.utils.getFragment(url) || '';
  qstr += '&pl=' + this.gettextCatalog_.currentLanguage;

  this.canceler_ = this.$q_.defer();
  this.api_.listDocuments(this.doctype, qstr, this.canceler_.promise).
    then(resp => {
      this.canceler_ = null;
      this.successList_(resp);
    });
};


/**
 * @param {angular.$http.Response} response Response from the API server.
 * @private
 */
app.AdvancedSearchController.prototype.successList_ = function(response) {
  if (!('data' in response)) {
    return;
  }
  const data = /** @type {appx.SearchDocumentResponse} */ (response['data']);
  this.documents = data.documents;
  this.total = data.total;
  this.noResults = this.documents.length === 0;
  this.scope_.$root['resCounter'] = this.total;
  // TODO: disable map interaction for document types with no geometry
  // "total" is needed for pagination though
  this.scope_.$root.$emit('searchFeaturesChange', this.getFeatures_(),
    this.total, this.recenter_);
  this.recenter_ = false;
};


/**
 * @return {Array.<ol.Feature>}
 * @private
 */
app.AdvancedSearchController.prototype.getFeatures_ = function() {
  const features = [];
  const format = new ol.format.GeoJSON();
  for (let i = 0, n = this.documents.length; i < n; i++) {
    const doc = this.documents[i];
    if ('geometry' in doc && doc['geometry'] && doc['geometry']['geom']) {
      const properties = this.createFeatureProperties_(doc);
      properties['geometry'] = format.readGeometry(doc['geometry']['geom']);
      features.push(new ol.Feature(properties));
    }
  }
  return features;
};


/**
 * @param {Object} doc Document data.
 * @return {Object}
 * @private
 */
app.AdvancedSearchController.prototype.createFeatureProperties_ = function(doc) {
  // Since the request is done with the "pl" parameter (prefered language),
  // the API returns the best locale first.
  const locale = doc['locales'][0];
  const properties = {
    'source': 'c2c',
    'module': this.doctype,
    'documentId': doc['document_id'],
    'lang': locale['lang'],
    'title': locale['title']
  };
  if (this.doctype === 'waypoints') {
    properties['type'] = doc['waypoint_type'];
  } else if (this.doctype === 'routes') {
    properties['title_prefix'] = locale['title_prefix'];
  } else if (this.doctype === 'outings') {
    properties['condition_rating'] = doc['condition_rating'];
  }
  return properties;
};


/**
 * @param {number} id Document id.
 * @export
 */
app.AdvancedSearchController.prototype.onMouseEnter = function(id) {
  this.scope_.$root.$emit('cardEnter', id);
};


/**
 * @param {number} id Document id.
 * @export
 */
app.AdvancedSearchController.prototype.onMouseLeave = function(id) {
  this.scope_.$root.$emit('cardLeave', id);
};


/**
 * @param {?number} id Document id.
 * @private
 */
app.AdvancedSearchController.prototype.onMapFeatureHover_ = function(id) {
  // Update feature id for card's ng-class in the partial
  this.highlightId = id;
  this.scope_.$apply();
};


app.module.controller('AppAdvancedSearchController', app.AdvancedSearchController);
