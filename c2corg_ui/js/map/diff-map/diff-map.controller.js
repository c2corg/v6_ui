import {DEFAULT_EXTENT, DEFAULT_ZOOM, DEFAULT_POINT_ZOOM} from '../map.controller';
import olBase from 'ol.js';
import olMap from 'ol/Map.js';
import olView from 'ol/View.js';
import olFormatGeoJSON from 'ol/format/GeoJSON.js';
import olInteractionMouseWheelZoom from 'ol/interaction/MouseWheelZoom.js';
import olLayerVector from 'ol/layer/Vector.js';
import olSourceVector from 'ol/source/Vector.js';
import olStyleCircle from 'ol/style/Circle.js';
import olStyleFill from 'ol/style/Fill.js';
import olStyleStroke from 'ol/style/Stroke.js';
import olStyleStyle from 'ol/style/Style.js';

/**
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of features to show on the map.
 * @constructor
 * @ngInject
 */
export default class MapSwitchController {
  constructor(mapFeatureCollection, UtilsService) {
    'ngInject';

    /**
     * @type {Array<ol.Feature>}
     * @private
     */
    this.features_ = [];

    if (mapFeatureCollection) {
      const format = new olFormatGeoJSON();
      this.features_ = format.readFeatures(mapFeatureCollection);
    }

    /**
     * @type {ol.Map}
     * @export
     */
    this.map = new olMap({
      interactions: olBase.interaction.defaults({mouseWheelZoom: false}),
      view: new olView({
        center: olBase.extent.getCenter(DEFAULT_EXTENT),
        zoom: DEFAULT_ZOOM
      })
    });

    const mouseWheelZoomInteraction = new olInteractionMouseWheelZoom();
    this.map.addInteraction(mouseWheelZoomInteraction);
    UtilsService.setupSmartScroll(mouseWheelZoomInteraction);

    if (!this.features_.length) {
      // Recentering on the features extent requires that the map actually
      // has a target. Else the map size cannot be computed.
      this.map.on('change:target', () => this.showFeatures_(this.features_));
    }
  }


  /**
   * @return {ol.layer.Vector} Vector layer.
   * @private
   */
  getVectorLayer_() {
    if (!this.vectorLayer_) {
      // style for the first version
      const fill1 = new olStyleFill({
        color: 'rgba(237, 41, 39, 0.6)'
      });
      const stroke1 = new olStyleStroke({
        color: 'rgba(237, 41, 39, 1)',
        width: 3
      });
      const style1 = new olStyleStyle({
        image: new olStyleCircle({
          fill: fill1,
          stroke: stroke1,
          radius: 10
        }),
        fill: fill1,
        stroke: stroke1
      });

      // style for the second version
      const fill2 = new olStyleFill({
        color: 'rgba(31, 157, 61, 0.9)'
      });
      const stroke2 = new olStyleStroke({
        color: 'rgba(31, 157, 61, 1)',
        width: 2
      });
      const style2 = new olStyleStyle({
        image: new olStyleCircle({
          fill: fill2,
          stroke: stroke2,
          radius: 5
        }),
        fill: fill2,
        stroke: stroke2
      });

      this.vectorLayer_ = new olLayerVector({
        source: new olSourceVector(),
        style: function(feature, style) {
          if (feature.get('type') === 'v1') {
            return style1;
          } else {
            return style2;
          }
        }
      });

      this.vectorLayer_.setMap(this.map);
    }
    return this.vectorLayer_;
  }


  /**
   * @param {Array<ol.Feature>} features Features to show.
   * @private
   */
  showFeatures_(features) {
    goog.asserts.assert(features.length > 0);
    const vectorLayer = this.getVectorLayer_();
    vectorLayer.getSource().addFeatures(features);

    const mapSize = this.map.getSize();
    if (mapSize) {
      this.map.getView().fit(vectorLayer.getSource().getExtent(), mapSize, {
        padding: [10, 10, 10, 10],
        maxZoom: DEFAULT_POINT_ZOOM
      });
    }
  }
}
