goog.provide('app.AdvancedSearchController');
goog.provide('app.advancedSearchDirective');

goog.require('app');
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
    bindToController: true,
    scope: true,
    templateUrl: '/static/partials/advancedsearch.html'
  };
};


app.module.directive('appAdvancedSearch', app.advancedSearchDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Api} appApi Api service.
 * @constructor
 * @export
 * @ngInject
 */
app.AdvancedSearchController = function($scope, $attrs, appApi) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {string}
   * @private
   */
  this.doctype_ = $attrs['documentType'];

  /**
   * @type {string}
   * @private
   */
  this.resCounter_ = $attrs['resultsCounter'];

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

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

  this.getResults_();
};


/**
 * @private
 */
app.AdvancedSearchController.prototype.getResults_ = function() {
  this.api_.listDocuments(this.doctype_).then(
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
  if (this.resCounter_) {
    $('#' + this.resCounter_).html(
      /** @type {string} */ (this.total.toString()));
  }
  // TODO: disable map interaction for document types with no geometry
  this.scope_.$root.$emit('searchFeaturesChange', this.getFeatures_());
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
      var properties = this.getFeatureProperties_(doc);
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
app.AdvancedSearchController.prototype.getFeatureProperties_ = function(doc) {
  // TODO choose the locale according to the UI lang and user prefs
  var locale = doc['locales'][0];
  var properties = {
    'module': this.doctype_,
    'documentId': doc['document_id'],
    'lang': locale['lang'],
    'title': locale['title']
  };
  if (this.doctype_ === 'waypoints') {
    properties['type'] = doc['waypoint_type'];
  }
  return properties;
};

app.module.controller('AppAdvancedSearchController', app.AdvancedSearchController);
