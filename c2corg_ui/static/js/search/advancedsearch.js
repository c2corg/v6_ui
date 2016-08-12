goog.provide('app.AdvancedSearchController');
goog.provide('app.advancedSearchDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.utils');
goog.require('ngeo.Location');
goog.require('ol.Feature');
goog.require('ol.format.GeoJSON');


/**
 * This directive is used to display the advanced search form and results.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.advancedSearchDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAdvancedSearchController',
    controllerAs: 'searchCtrl',
    bindToController: {
      'doctype': '@documentType',
      'useMap': '='
    },
    scope: true,
    templateUrl: '/static/partials/advancedsearch.html'
  };
};


app.module.directive('appAdvancedSearch', app.advancedSearchDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {app.Api} appApi Api service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.AdvancedSearchController = function($scope, appApi, ngeoLocation,
    gettextCatalog) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

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
   * @type {?number}
   * @export
   */
  this.highlightId = null;

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
  this.scope_.$root.$on('searchFilterChange', this.getResults_.bind(this));

  // Get the initial results when loading the page unless a map is used.
  // In that case wait to get the map extent before triggering the request.
  if (!this.useMap || this.recenter_) {
    this.getResults_();
  }

  if (this.useMap) {
    // Hilight matching cards when a map feature is hovered
    this.scope_.$root.$on('mapFeatureHover', function(event, id) {
      this.onMapFeatureHover_(id);
    }.bind(this));
  }
};


/**
 * @private
 */
app.AdvancedSearchController.prototype.getResults_ = function() {
  var url = this.location_.getUriString();
  var qstr = goog.uri.utils.getFragment(url) || '';
  qstr += '&pl=' + this.gettextCatalog_.currentLanguage;
  qstr = qstr.replace('debug', ''); // FIXME better handling of special params?
  this.api_.listDocuments(this.doctype, qstr).then(
    this.successList_.bind(this)
  );
};


/**
 * @param {angular.$http.Response} response Response from the API server.
 * @private
 */
app.AdvancedSearchController.prototype.successList_ = function(response) {
  if (!('data' in response)) {
    return;
  }
  var data = /** @type {appx.SearchDocumentResponse} */ (response['data']);
  this.documents = data.documents;
  this.total = data.total;
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
  var features = [];
  var format = new ol.format.GeoJSON();
  for (var i = 0, n = this.documents.length; i < n; i++) {
    var doc = this.documents[i];
    if ('geometry' in doc && doc['geometry']) {
      var properties = this.createFeatureProperties_(doc);
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
  var locale = doc['locales'][0];
  var properties = {
    'module': this.doctype,
    'documentId': doc['document_id'],
    'lang': locale['lang'],
    'title': locale['title']
  };
  if (this.doctype === 'waypoints') {
    properties['type'] = doc['waypoint_type'];
  } else if (this.doctype === 'routes') {
    properties['title_prefix'] = locale['title_prefix'];
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
