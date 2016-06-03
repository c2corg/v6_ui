goog.provide('app.AdvancedSearchController');
goog.provide('app.advancedSearchDirective');

goog.require('app');
goog.require('app.Api');
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
      'resCounter': '@resultsCounter'
    },
    scope: true,
    templateUrl: '/static/partials/advancedsearch.html'
  };
};


app.module.directive('appAdvancedSearch', app.advancedSearchDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Api} appApi Api service.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @export
 * @struct
 * @ngInject
 */
app.AdvancedSearchController = function($scope, $attrs, appApi, ngeoLocation,
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
   * @type {string}
   * @export
   */
  this.resCounter;

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

  // Get the initial results when loading the page.
  // If a map is used, wait to get the map extent
  // before triggering the request.
  if (!$attrs['useMap']) {
    this.getResults_();
  }

  // Refresh the results when pagination or criterias have changed:
  this.scope_.$root.$on('searchFilterChange', this.getResults_.bind(this));
};


/**
 * @private
 */
app.AdvancedSearchController.prototype.getResults_ = function() {
  var url = this.location_.getUriString();
  var qstr = goog.uri.utils.getQueryData(url) || '';
  qstr += '&pl=' + this.gettextCatalog_.currentLanguage;
  qstr = qstr.replace('debug', ''); // FIXME better handling of special params?
  this.api_.listDocuments(this.doctype, qstr).then(
    this.successList_.bind(this)
  );
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.AdvancedSearchController.prototype.successList_ = function(response) {
  if (!('data' in response)) {
    return;
  }
  this.documents = response['data']['documents'];
  this.total = response['data']['total'];
  if (this.resCounter) {
    $('#' + this.resCounter).html(
      /** @type {string} */ (this.total.toString()));
  }
  // TODO: disable map interaction for document types with no geometry
  // "total" is needed for pagination though
  this.scope_.$root.$emit('searchFeaturesChange', this.getFeatures_(),
    this.total);
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
 * @param {Object} doc document data.
 * @return {Object}
 * @private
 */
app.AdvancedSearchController.prototype.createFeatureProperties_ = function(doc) {
  // TODO choose the locale according to the UI lang and user prefs
  var locale = doc['locales'][0];
  var properties = {
    'module': this.doctype,
    'documentId': doc['document_id'],
    'lang': locale['lang'],
    'title': locale['title']
  };
  if (this.doctype === 'waypoints') {
    properties['type'] = doc['waypoint_type'];
  }
  return properties;
};

app.module.controller('AppAdvancedSearchController', app.AdvancedSearchController);
