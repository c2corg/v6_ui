/**
 * Adapted from https://github.com/camptocamp/agridea_geoacorda/blob/master/jsapi/src/searchcontrol.js
 */

import olFormatGeoJSON from 'ol/format/geojson';
import olProj from 'ol/proj';

/**
 * @type {string}
 * @const
 */
const SEARCH_URL = 'https://photon.komoot.de/api/';

/**
 * @constructor
 * @param {angular.Scope} $rootScope Angular root scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @ngInject
 * @ignore
 */
export default class MapSearchController {
  constructor($rootScope, $compile, gettextCatalog, documentEditing) {
    'ngInject';

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
    const bloodhoundEngine = this.createAndInitBloodhound_();

    this.geoJsonFormat_ = new olFormatGeoJSON({
      featureProjection: documentEditing.DATA_PROJ
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
          return '<p class="no-result">' + this.gettextCatalog_.getString('No result') + '</p>';
        }.bind(this),
        pending: '<p class="results-loading"></p>'
      }
    }];

    /**
     * @type {ngeox.SearchDirectiveListeners}
     * @export
     */
    this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
      select: this.select_.bind(this)
    });
  }

  /**
   * @return {Bloodhound} The bloodhound engine.
   * @private
   */
  createAndInitBloodhound_() {
    let url = SEARCH_URL;
    url += '?q=%QUERY';

    const bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
      limit: 10,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
      remote: {
        url: url,
        wildcard: '%QUERY',
        rateLimitWait: 50,
        prepare: (function(query, settings) {
          let url = settings['url'] + '&lang=' + this.gettextCatalog_.currentLanguage;

          const center = this.map.getView().getCenter();
          if (center !== undefined) {
            // give priority to nearby results
            const centerWgs84 = olProj.toLonLat(center);
            url += '&lon=' + centerWgs84[0] + '&lat=' + centerWgs84[1];
          }

          settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
          return settings;
        }).bind(this),

        filter: function(resp) {
          const features = this.geoJsonFormat_.readFeatures(resp);
          features.forEach((feature) => {
            const addressInfo = [];
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
              const name = feature.get('name') + ' (' + addressInfo.join(', ') + ')';
              feature.set('name', name);
            }
          });
          return features;
        }.bind(this)
      }
    }));

    bloodhound.initialize();
    return bloodhound;
  }


  /**
   * @param {jQuery.Event} event Event.
   * @param {Object} suggestion Suggestion.
   * @param {TypeaheadDataset} dataset Dataset.
   * @this {app.MapSearchController}
   * @private
   */
  select_(event, suggestion, dataset) {
    const map = /** @type {ol.Map} */ (this.map);
    const feature = /** @type {ol.Feature} */ (suggestion);

    let geomOrExtent;
    if (feature.get('extent')) {
      const extent = /** @type{ol.Extent} */ (feature.get('extent'));
      geomOrExtent = olProj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
    } else {
      geomOrExtent = /** @type {ol.geom.SimpleGeometry} */
        (feature.getGeometry());
    }

    const mapSize = /** @type {ol.Size} */ (map.getSize());
    map.getView().fit(geomOrExtent, mapSize,
      /** @type {olx.view.FitOptions} */ ({maxZoom: 12}));
  }
}
