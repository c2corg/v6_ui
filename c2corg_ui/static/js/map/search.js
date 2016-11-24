/**
 * Adapted from https://github.com/camptocamp/agridea_geoacorda/blob/master/jsapi/src/searchcontrol.js
 */
goog.provide('app.MapSearchController');
goog.provide('app.mapSearchDirective');

goog.require('app');
goog.require('app.constants');
/** @suppress {extraRequire} */
goog.require('ngeo.searchDirective');
goog.require('ol.Feature');
goog.require('ol.format.GeoJSON');
goog.require('ol.proj');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.mapSearchDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'map': '=appMapSearchMap'
    },
    controller: 'AppMapSearchController',
    bindToController: true,
    controllerAs: 'searchCtrl',
    templateUrl: '/static/partials/map/search.html',
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} element Element.
         * @param {angular.Attributes} attrs Atttributes.
         */
        function(scope, element, attrs) {
          // Empty the search field on focus and blur.
          element.find('input').on('focus blur', function() {
            $(this).val('');
          });
        }
  };
};

app.module.directive('appMapSearch', app.mapSearchDirective);


/**
 * @constructor
 * @param {angular.Scope} $rootScope Angular root scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @ngInject
 * @ignore
 */
app.MapSearchController = function($rootScope, $compile, gettextCatalog) {

  /**
   * @type {ol.Map}
   * @export
   */
  this.map;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /** @type {Bloodhound} */
  var bloodhoundEngine = this.createAndInitBloodhound_();

  this.geoJsonFormat_ = new ol.format.GeoJSON({
    featureProjection: app.constants.documentEditing.DATA_PROJ
  });

  /**
   * @type {TypeaheadOptions}
   * @export
   */
  this.options = /** @type {TypeaheadOptions} */ ({
    highlight: true,
    hint: undefined,
    minLength: undefined
  });

  /**
   * @type {Array.<TypeaheadDataset>}
   * @export
   */
  this.datasets = [{
    source: bloodhoundEngine.ttAdapter(),
    display: function(feature) {
      return feature.get('name');
    },
    limit: Infinity,
    identify: function(feature) {
      return feature.get('osm_id');
    },
    templates: {
      suggestion: function(feature) {
        return '<p>' + feature.get('name') + '</p>';
      },
      notFound: function() {
        return this.gettextCatalog_.getString('No result');
      }.bind(this)
    }
  }];

  /**
   * @type {ngeox.SearchDirectiveListeners}
   * @export
   */
  this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
    select: app.MapSearchController.select_.bind(this)
  });

};


/**
 * @type {string}
 * @const
 */
app.MapSearchController.SEARCH_URL = 'https://photon.komoot.de/api/';


/**
 * @return {Bloodhound} The bloodhound engine.
 * @private
 */
app.MapSearchController.prototype.createAndInitBloodhound_ = function() {
  var url = app.MapSearchController.SEARCH_URL;
  url += '?q=%QUERY';

  var bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
    limit: 10,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    remote: {
      url: url,
      wildcard: '%QUERY',
      rateLimitWait: 50,
      prepare: (function(query, settings) {
        var url = settings['url'] + '&lang=' + this.gettextCatalog_.currentLanguage;

        var center = this.map.getView().getCenter();
        if (center !== undefined) {
          // give priority to nearby results
          var centerWgs84 = ol.proj.toLonLat(center);
          url += '&lon=' + centerWgs84[0] + '&lat=' + centerWgs84[1];
        }

        settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
        return settings;
      }).bind(this),

      filter: function(resp) {
        var features = this.geoJsonFormat_.readFeatures(resp);
        features.forEach(function(feature) {
          var addressInfo = [];
          if (feature.get('city')) {
            addressInfo.push(feature.get('city'));
          }
          if (feature.get('state')) {
            addressInfo.push(feature.get('state'));
          }
          if (feature.get('country')) {
            addressInfo.push(feature.get('country'));
          }

          if (addressInfo.length > 0) {
            var name = feature.get('name') + ' (' + addressInfo.join(', ') + ')';
            feature.set('name', name);
          }
        });
        return features;
      }.bind(this)
    }
  }));

  bloodhound.initialize();
  return bloodhound;
};


/**
 * @param {jQuery.Event} event Event.
 * @param {Object} suggestion Suggestion.
 * @param {TypeaheadDataset} dataset Dataset.
 * @this {app.MapSearchController}
 * @private
 */
app.MapSearchController.select_ = function(event, suggestion, dataset) {
  var map = /** @type {ol.Map} */ (this.map);
  var feature = /** @type {ol.Feature} */ (suggestion);
  var featureGeometry = /** @type {ol.geom.SimpleGeometry} */
      (feature.getGeometry());
  var mapSize = /** @type {ol.Size} */ (map.getSize());
  map.getView().fit(featureGeometry, mapSize,
      /** @type {olx.view.FitOptions} */ ({maxZoom: 12}));
};


app.module.controller('AppMapSearchController', app.MapSearchController);
