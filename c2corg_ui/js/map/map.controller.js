import angular from 'angular';
import olCollection from 'ol/collection';
import olControl from 'ol/control';
import olFeature from 'ol/feature';
import olMap from 'ol/map';
import olView from 'ol/view';
import olControlScaleLine from 'ol/control/scaleline';
import olFormatGeoJSON from 'ol/format/geojson';
import olFormatGPX from 'ol/format/gpx';
import olExtent from 'ol/extent';
import olEventsCondition from 'ol/events/condition';
import olGeomMultiLineString from 'ol/geom/multilinestring';
import olInteractionDragAndDrop from 'ol/interaction/draganddrop';
import olInteractionDraw from 'ol/interaction/draw';
import olInteractionModify from 'ol/interaction/modify';
import olInteractionMouseWheelZoom from 'ol/interaction/mousewheelzoom';
import olInteraction from 'ol/interaction';
import olLayerVector from 'ol/layer/vector';
import olProj from 'ol/proj';
import olSourceVector from 'ol/source/vector';
import olStyleCircle from 'ol/style/circle';
import olStyleFill from 'ol/style/fill';
import olStyleIcon from 'ol/style/icon';
import olStyleStroke from 'ol/style/stroke';
import olStyleStyle from 'ol/style/style';
import olStyleText from 'ol/style/text';
import debounce from 'lodash/debounce';

/**
 * @const
 * @type {Array.<number>}
 */
const DEFAULT_EXTENT = [-400000, 5200000, 1200000, 6000000];


/**
 * @const
 * @type {number}
 */
const DEFAULT_ZOOM = 4;


/**
 * @const
 * @type {number}
 */
const DEFAULT_POINT_ZOOM = 12;


export {DEFAULT_EXTENT, DEFAULT_ZOOM, DEFAULT_POINT_ZOOM};

/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features to show on the map.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Url} appUrl URL service.
 * @param {app.Biodivsports} appBiodivsports service.
 * @param {app.Lang} LangService Lang service.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap
 * @param {string} imgPath Path to the image directory.
 * @constructor
 * @struct
 * @ngInject
 */
export default class MapController {
  constructor($scope, mapFeatureCollection, ngeoLocation, UrlService, BiodivsportsService, LangService, $uibModal,
    imgPath, UtilsService, SimplifyService) {
    'ngInject';

    this.utilsService_ = UtilsService;

    this.simplifyService_ = SimplifyService;

    /**
     * @type {number}
     * @export
     */
    this.zoom;

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;

    /**
     * @type {string}
     * @private
     */
    this.imgPath_ = imgPath;

    /**
     * @type {?ol.layer.Vector}
     * @private
     */
    this.vectorLayer_ = null;

    /**
     * @type {Object.<string, ol.style.Icon>}
     */
    this.iconCache = {};

    /**
     * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
     */
    this.styleCache = {};

    /**
     * @type {Array<ol.Feature>}
     * @private
     */
    this.features_ = [];

    /**
     * @type {?ol.geom.GeometryType}
     * @export
     */
    this.drawType; // For Closure, comes from isolated scope.

    /**
     * @type {boolean}
     * @export
     */
    this.advancedSearch;

    /**
     * @type {boolean}
     * @export
     */
    this.edit;

    /**
     * @type {boolean}
     * @export
     */
    this.disableWheel;

    /**
     * @type {boolean}
     * @export
     */
    this.showRecenterTools;

    /**
     * @type {boolean}
     * @export
     */
    this.showBiodivsportsAreas;

    /**
     * @type {Array.<string>}
     * @export
     */
    this.biodivSportsActivities;

    /**
     * @type {boolean}
     * @export
     */
    this.defaultMapFilter;

    /**
     * @type {boolean}
     * @export
     */
    this.enableMapFilter = !!this.defaultMapFilter;

    /**
     * @type {?GeoJSONFeatureCollection}
     * @export
     */
    this.featureCollection;

    /**
     * @type {ngeo.Location}
     * @private
     */
    this.location_ = ngeoLocation;

    /**
     * @type {ol.format.GeoJSON}
     * @private
     */
    this.geojsonFormat_ = new olFormatGeoJSON();

    /**
     * @type {?ol.Extent}
     * @private
     */
    this.initialExtent_ = null;

    /**
     * @type {?ol.Feature}
     * @private
     */
    this.initialFeature_ = null;

    /**
     * Remember the initial geometry so that the changes can be reset.
     * @type {?Object|undefined}
     * @private
     */
    this.initialGeometry_ = undefined;

    /**
     * @type {ol.interaction.Draw}
     * @private
     */
    this.draw_;

    /**
     * @type {boolean}
     * @private
     */
    this.isDrawing_ = false;

    /**
     * @type {?number|string}
     * @private
     */
    this.currentSelectedFeatureId_ = null;

    /**
     * @type {boolean}
     * @export
     */
    this.isFullscreen = false;

    /**
     * @type {boolean}
     * @private
     */
    this.ignoreExtentChange_ = false;

    /**
     * @type {app.Url}
     * @private
     */
    this.urlService = UrlService;

    /**
     * @type {app.Biodivsports}
     * @private
     */
    this.biodivSportsService_ = BiodivsportsService;

    /**
     * @type {app.Lang}
     * @private
     */
    this.langService_ = LangService;

    /**
     * @type {ui.bootstrap.$modal} angular bootstrap modal
     * @private
     */
    this.modal_ = $uibModal;

    /**
     * @type {ol.Map}
     * @export
     */
    this.map = new olMap({
      interactions: olInteraction.defaults({mouseWheelZoom: false}),
      controls: olControl.defaults().extend([new olControlScaleLine()]),
      view: new olView({
        center: olExtent.getCenter(DEFAULT_EXTENT),
        zoom: DEFAULT_ZOOM
      })
    });

    /**
     * @type {ol.View}
     * @private
     */
    this.view_ = this.map.getView();

    // editing mode
    if (this.edit) {
      this.scope_.$root.$on('documentDataChange', this.handleEditModelChange_.bind(this));
      this.scope_.$root.$on('featuresUpload', this.handleFeaturesUpload_.bind(this));
      this.addTrackImporter_();
    }

    // advanced search mode
    if (this.advancedSearch) {
      this.scope_.$root.$on('resizeMap', debounce(this.resizeMap_.bind(this), 300));

      if (this.location_.hasFragmentParam('bbox')) {
        this.enableMapFilter = true;
        const bbox = this.location_.getFragmentParam('bbox');
        const extent = bbox.split(',');
        if (extent.length == 4) {
          this.initialExtent_ = extent.map((x) => {
            return parseInt(x, 10);
          });
        }
      } else {
        this.ignoreExtentChange_ = this.utilsService_.detectDocumentIdFilter(this.location_);
      }

      this.scope_.$root.$on('searchFeaturesChange', this.handleSearchChange_.bind(this));
      this.scope_.$root.$on('searchFilterClear', this.handleSearchClear_.bind(this));
      this.scope_.$root.$on('cardEnter', (event, id) => {
        this.toggleFeatureHighlight_(id, true);
      });
      this.scope_.$root.$on('cardLeave', (event, id) => {
        this.toggleFeatureHighlight_(id, false);
      });

      this.view_.on('propertychange', debounce(this.handleMapSearchChange_.bind(this), 500));

      this.scope_.$watch(() => {
        return this.enableMapFilter;
      }, this.handleMapFilterSwitchChange_.bind(this));
    }

    if (!this.disableWheel) {
      const mouseWheelZoomInteraction = new olInteractionMouseWheelZoom();
      this.map.addInteraction(mouseWheelZoomInteraction);
      this.utilsService_.setupSmartScroll(mouseWheelZoomInteraction);
    }

    if (this.featureCollection || mapFeatureCollection) {
      this.features_ = this.geojsonFormat_.readFeatures(
        this.featureCollection || mapFeatureCollection);
    }

    // add the features interactions
    if (this.features_.length > 0 || this.advancedSearch) {
      this.getVectorLayer_().setStyle(this.createStyleFunction_());
      this.map.on('click', this.handleMapFeatureClick_.bind(this));
      this.map.on('pointermove', this.handleMapFeatureHover_.bind(this));
    }

    if (this.edit && this.drawType) {
      const vectorSource = this.getVectorLayer_().getSource();

      this.draw_ = new olInteractionDraw({
        source: vectorSource,
        type: this.drawType
      });
      this.draw_.on('drawstart', this.handleDrawStart_.bind(this));
      this.draw_.on('drawend', this.handleDrawEnd_.bind(this));
      this.map.addInteraction(this.draw_);

      this.map.once('postrender', () => {
        // add modify interaction after the map has been initialized
        const modify = new olInteractionModify({
          features: vectorSource.getFeaturesCollection(),
          // the SHIFT key must be pressed to delete vertices, so
          // that new vertices can be drawn at the same position
          // of existing vertices
          deleteCondition: function(event) {
            return olEventsCondition.shiftKeyOnly(event) &&
              olEventsCondition.singleClick(event);
          }
        });
        modify.on('modifyend', this.handleModify_.bind(this));
        this.map.addInteraction(modify);
      });
    }

    // When the map is rendered:
    this.map.once('change:size', event => {
      if (this.features_.length > 0) {
        this.showFeatures_(this.features_, true);
      } else {
        const extent = this.initialExtent_ || DEFAULT_EXTENT;
        this.recenterOnExtent_(extent);
      }
      if (this.showBiodivsportsAreas) {
        let extent = this.view_.calculateExtent(this.map.getSize() || null);
        // get extent in WGS format
        extent = olProj.transformExtent(extent, olProj.get('EPSG:3857'), olProj.get('EPSG:4326'));
        this.biodivSportsService_.fetchData(extent, this.biodivSportsActivities).then(this.addBiodivsportsData_.bind(this));
      }
    });
  }


  /**
   * @param {Object} response Biodiv'sports request result.
   * @private
   */
  addBiodivsportsData_(response) {
    const results = response['data']['results'];
    const features = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      let geometry = result['geometry'];
      geometry = this.geojsonFormat_.readGeometry(geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      const feature = new olFeature({
        geometry,
        'id': /** @type {number} */ (result['id']),
        'source': 'biodivsports',
        'title': /** @type {string} */ (result['name']),
        'description': /** @type {string} */ (result['description']),
        'info_url': /** @type {string} */ (result['info_url']),
        'kml_url': /** @type {string} */ (result['kml_url']),
        'period': /** @type {Array<boolean>} */ (result['period'])
      });
      feature.setId('biodiv_' + /** @type {number} */ (result['id']));
      features.push(feature);

    }
    this.getVectorLayer_().getSource().addFeatures(features);
    if (features.length) {
      this.scope_.$emit('foundBiodivsportAreas');
    }
  }


  /**
   * @param {ol.Extent} extent Extent to recenter to.
   * @param {olx.view.FitOptions=} options Options.
   * @private
   */
  recenterOnExtent_(extent, options) {
    const mapSize = this.map.getSize();
    if (!mapSize || !olExtent.getWidth(extent) || !olExtent.getHeight(extent)) {
      this.view_.setCenter(olExtent.getCenter(extent));
      this.view_.setZoom(this.zoom || DEFAULT_POINT_ZOOM);
    } else {
      options = options || {};
      this.view_.fit(extent, mapSize, options);
    }
  }


  /**
   * @return {ol.layer.Vector} Vector layer.
   * @private
   */
  getVectorLayer_() {
    if (!this.vectorLayer_) {
      // The Modify interaction requires the vector source is created
      // with an ol.Collection.
      const features = new olCollection();
      this.vectorLayer_ = new olLayerVector({
        source: new olSourceVector({features: features})
      });

      // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
      // makes the vector layer "unmanaged", meaning that it is always on top.
      this.vectorLayer_.setMap(this.map);
    }
    return this.vectorLayer_;
  }


  /**
   * @return {ol.StyleFunction}
   * @private
   */
  createStyleFunction_() {
    return (
      /**
       * @param {ol.Feature|ol.render.Feature} feature
       * @param {number} resolution
       * @return {ol.style.Style|Array.<ol.style.Style>}
       */
      function(feature, resolution) {
        const source = /** @type {string} */ (feature.get('source'));
        if (source === 'biodivsports') {
          return this.createBiodivsportsAreaStyle_(feature, resolution);
        } else if (source === 'c2c') {
          const module = /** @type {string} */ (feature.get('module'));
          switch (module) {
            case 'waypoints':
            case 'images':
            case 'profiles':
            case 'xreports':
              return this.createPointStyle_(feature, resolution);
            case 'routes':
            case 'outings':
              return this.advancedSearch ? this.createPointStyle_(feature, resolution) : this.createLineStyle_(feature, resolution);
            case 'areas':
              return this.createLineStyle_(feature, resolution);
            default: {
              return null;
            }
          }
        }
        return null;
      }).bind(this);
  }


  createBiodivsportsAreaStyle_(feature, resolution) {
    const id = /** @type {number} */ (feature.get('id'));
    const highlight = /** @type {boolean} */ (!!feature.get('highlight'));
    const key = 'lines_biodivsports'  + (highlight ? ' _highlight' : '') + '_' + id;
    const opacityFactor = highlight ? 1.5 : 1;
    let style = this.styleCache[key];
    if (!style) {
      const stroke = new olStyleStroke({
        color: [51, 122, 183, 0.8 * opacityFactor],
        width: 1
      });
      const fill = new olStyleFill({
        color: [51, 122, 183, 0.4 * opacityFactor]
      });
      style = new olStyleStyle({
        text: this.createTextStyle_(feature, 'biodivsports', highlight),
        stroke,
        fill
      });
      this.styleCache[key] = style;
    }
    return style;
  }

  /**
   * @param {ol.Feature|ol.render.Feature} feature
   * @param {number} resolution
   * @return {ol.style.Style|Array.<ol.style.Style>}
   * @private
   */
  createPointStyle_(feature, resolution) {
    const module = feature.get('module');
    let path;
    let imgSize;
    let type = /** @type {string} */ (feature.get('module'));
    if (type === 'waypoints' && feature.get('type')) {
      type = /** @type {string} */ (feature.get('type'));
    }
    const id = /** @type {number} */ (feature.get('documentId'));
    const highlight = /** @type {boolean} */ (!!feature.get('highlight'));
    const scale = highlight ? 0.55 : 0.4;

    imgSize = highlight ? 22 : 16;
    switch (module) {
      case 'waypoints':
        path = '/documents/waypoints/' + type + '.svg';
        break;
      case 'images':
        imgSize = 0; // no circle for images
        path = '/documents/images.svg';
        break;
      case 'profiles':
        path = '/documents/profile.svg';
        break;
      default:
        path = '/documents/' + type + '.svg';
        break;
    }

    const key = type + scale + '_' + id;
    let styles = this.styleCache[key];
    if (!styles) {
      let iconKey = type + scale;
      if (type === 'outings') {
        // outing icon color depends on the condition_rating attribute
        iconKey += '_' + id;
      }
      let icon = this.iconCache[iconKey];
      if (!icon) {
        icon = new olStyleIcon(/** @type {olx.style.IconOptions} */ ({
          scale: scale,
          color: this.getIconColor_(feature),
          src: this.imgPath_ + path
        }));
        this.iconCache[iconKey] = icon;
      }
      styles = [
        // render a transparent circle behind the actual icon so that selecting
        // is easier (the icons contain transparent areas that are not
        // selectable).
        new olStyleStyle({
          image: new olStyleCircle({
            radius: imgSize,
            fill: new olStyleFill({
              color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new olStyleStroke({
              color: '#ddd',
              width: 2
            })
          })
        }),
        new olStyleStyle({
          image: icon,
          text: this.createTextStyle_(feature, type, highlight)
        })
      ];
      this.styleCache[key] = styles;
    }
    return styles;
  }


  /**
   * @param {ol.Feature|ol.render.Feature} feature
   * @param {number} resolution
   * @return {ol.style.Style|Array.<ol.style.Style>}
   * @private
   */
  createLineStyle_(feature, resolution) {
    const type = /** @type {string} */ (feature.get('module'));
    const highlight = /** @type {boolean} */ (feature.get('highlight'));
    const id = /** @type {number} */ (feature.get('documentId'));
    const key = 'lines' + (highlight ? ' _highlight' : '') + '_' + id;
    let style = this.styleCache[key];
    if (!style) {
      const stroke = new olStyleStroke({
        color: highlight ? 'red' : 'yellow',
        width: 3
      });
      style = new olStyleStyle({
        text: this.createTextStyle_(feature, type, highlight),
        stroke: stroke
      });
      this.styleCache[key] = style;
    }
    return style;
  }


  /**
   * @param {ol.Feature|ol.render.Feature} feature
   * @param {string} type
   * @param {boolean} highlight
   * @return {ol.style.Text|undefined}
   * @private
   */
  createTextStyle_(feature, type, highlight) {
    let text;
    if (highlight) { // on hover in list view
      let title = '';
      if (type === 'routes' && feature.get('title_prefix')) {
        title = feature.get('title_prefix') + ' : ';
      }
      if (type === 'biodivsports') {
        title = this.langService_.translate('Sensitive area:') + ' ';
      }
      title += feature.get('title');

      text = new olStyleText({
        text: this.utilsService_.stringDivider(title, 30, '\n'),
        textAlign: 'left',
        offsetX: 20,
        font: '12px verdana,sans-serif',
        stroke: new olStyleStroke({
          color: 'white',
          width: 3
        }),
        fill: new olStyleFill({
          color: 'black'
        }),
        textBaseline: 'middle'
      });
    }
    return text;
  }


  /**
   * @param {ol.Feature|ol.render.Feature} feature
   * @return {string|undefined}
   * @private
   */
  getIconColor_(feature) {
    let color;
    if (feature.get('module') === 'outings') {
      switch (feature.get('condition_rating')) {
        case 'excellent':
          color = '#008000';
          break;
        case 'good':
          color = '#9ACD32';
          break;
        case 'average':
          color = '#FFFF00';
          break;
        case 'poor':
          color = '#FF0000';
          break;
        case 'awful':
          color = '#8B0000';
          break;
        default:
          // Usual icon orange
          color = '#FFAA45';
          break;
      }
    }
    return color;
  }


  /**
   * @param {Array.<ol.Feature>} features Features to show.
   * @param {boolean} recenter Whether or not to recenter on the features.
   * @private
   */
  showFeatures_(features, recenter) {
    const vectorLayer = this.getVectorLayer_();
    const source = vectorLayer.getSource();
    source.clear();

    if (!features.length) {
      if (recenter) {
        this.recenterOnExtent_(DEFAULT_EXTENT);
      }
      return;
    }

    features.forEach(feature => {
      const properties = feature.getProperties();
      if (properties['documentId']) {
        feature.setId(/** @type {number} */ (properties['documentId']));
      }
    });

    source.addFeatures(features);
    if (recenter) {
      this.recenterOnExtent_(source.getExtent(), {
        padding: [10, 10, 10, 10]
      });
    }
  }


  /**
   * @param {Object} event
   * @param {Object} data
   * @private
   */
  handleEditModelChange_(event, data) {
    if (this.initialGeometry_ === undefined) {
      this.initialGeometry_ = data['geometry'] ? angular.copy(data['geometry']) : null;
    }

    if (!('geometry' in data && data['geometry'])) {
      return;
    }
    const geomattr = this.drawType == 'Point' ? 'geom' : 'geom_detail';
    let geomstr = data['geometry'][geomattr];
    let geometry;
    if (geomstr) {
      geometry = this.geojsonFormat_.readGeometry(geomstr);
      const features = [new olFeature(geometry)];
      this.showFeatures_(features, true);
    } else if (this.drawType != 'Point') {
      // recenter the map on the default point geometry for routes or outings
      // with no geom_detail
      geomstr = data['geometry']['geom'];
      geometry = /** @type {ol.geom.Point} */ (this.geojsonFormat_.readGeometry(geomstr));
      this.view_.setCenter(geometry.getCoordinates());
      this.view_.setZoom(this.zoom || DEFAULT_POINT_ZOOM);
    }
  }


  /**
   * @param {Object} event
   * @param {Array.<ol.Feature>} features Uploaded features.
   * @private
   */
  handleFeaturesUpload_(event, features) {
    features = features.filter(this.utilsService_.isLineFeature);
    features = this.validateFeatures_(features);
    features.forEach(this.simplifyFeature_);
    this.showFeatures_(features, true);
    this.scope_.$root.$emit('mapFeaturesChange', features);
  }


  /**
   *
   * @param {Array.<ol.Feature>} features - invalid features that have to be checked
   * @returns {Array.<ol.Feature>} features - this geometry is valid
   * @private
   */
  validateFeatures_(features) {
    for (let i = 0; i < features.length; i++) {
      const geom = /** @type{ol.geom.Geometry} */ (features[i].getGeometry());

      if (geom instanceof olGeomMultiLineString) {
        const multiLineString = /** @type{ol.geom.MultiLineString} */ (geom);
        const lineStrings = multiLineString.getLineStrings();

        for (let j = 0; j < lineStrings.length; j++) {
          if (lineStrings[j].getCoordinates().length === 1) {
            lineStrings.splice(j, 1);
          }
        }

        const newMs = new olGeomMultiLineString([]);
        newMs.setLineStrings(lineStrings);
        features[i].setGeometry(newMs);
      }
    }
    return features;
  }


  /**
   * @param {ol.interaction.Draw.Event} event
   * @private
   */
  handleDrawStart_(event) {
    this.isDrawing_ = true;
    const feature = event.feature;
    // Only one feature can be drawn at a time
    const source = this.getVectorLayer_().getSource();
    source.getFeatures().forEach((f) => {
      if (f !== feature) {
        source.removeFeature(f);
      }
    });
  }


  /**
   * @param {ol.interaction.Draw.Event} event
   * @private
   */
  handleDrawEnd_(event) {
    this.isDrawing_ = false;
    this.scope_.$root.$emit('mapFeaturesChange', [event.feature]);
    this.scope_.$applyAsync();
  }


  /**
   * @param {ol.interaction.Modify.Event} event
   * @private
   */
  handleModify_(event) {
    const features = event.features.getArray();
    this.scope_.$root.$emit('mapFeaturesChange', features);
  }


  /**
   * @param {Object} event
   * @param {Array.<ol.Feature>} features Search results features.
   * @param {number} total Total number of results.
   * @param {boolean} recenter
   * @private
   */
  handleSearchChange_(event, features, total, recenter) {
    // show the search results on the map but don't change the map filter
    // if recentering on search results, the extent change must not trigger
    // a new search request.
    this.ignoreExtentChange_ = recenter;
    recenter = recenter || !this.enableMapFilter;
    this.showFeatures_(features, recenter);
  }


  /**
   * @param {Object} event
   * @private
   */
  handleSearchClear_(event) {
    if (!this.location_.hasFragmentParam('bbox')) {
      const mapSize = this.map.getSize();
      if (mapSize) {
        let extent = this.view_.calculateExtent(mapSize);
        extent = extent.map(Math.floor);
        this.location_.updateFragmentParams({
          'bbox': extent.join(',')
        });
      }
    }
  }


  /**
   * @param {number|string} id Feature id.
   * @param {boolean} highlight Whether the feature must be highlighted.
   * @private
   */
  toggleFeatureHighlight_(id, highlight) {
    const feature = this.getVectorLayer_().getSource().getFeatureById(id);
    if (feature) {
      this.currentSelectedFeatureId_ = highlight ? id : null;
      feature.set('highlight', highlight);
    }
  }


  /**
   * @private
   */
  handleMapSearchChange_() {
    if (!this.enableMapFilter) {
      return;
    }
    if (this.initialExtent_) {
      // The map has just been set with an extent passed as permalink
      // => no need to set it again in the URL.
      this.initialExtent_ = null;
      this.scope_.$root.$emit('searchFilterChange');
    } else {
      const mapSize = this.map.getSize();
      if (mapSize) {
        if (this.ignoreExtentChange_) {
          this.ignoreExtentChange_ = false;
          return;
        }
        let extent = this.view_.calculateExtent(mapSize);
        extent = extent.map(Math.floor);
        this.location_.updateFragmentParams({
          'bbox': extent.join(',')
        });
        this.location_.deleteFragmentParam('offset');
        this.scope_.$root.$emit('searchFilterChange');
      }
    }
  }


  /**
   * @param {ol.MapBrowserEvent} event
   * @private
   */
  handleMapFeatureClick_(event) {
    const feature = this.map.forEachFeatureAtPixel(event.pixel, feature => feature, this, function(layer) {
      // test only features from the current vector layer
      return layer === this.getVectorLayer_();
    }, this);
    if (feature) {
      const source = feature.get('source');
      if (source === 'c2c') {
        const module = feature.get('module');
        const id = feature.get('documentId');
        const locale = {
          'lang': feature.get('lang'),
          'title': feature.get('title')
        };
        if (module === 'routes' && feature.get('title_prefix')) {
          locale['title_prefix'] = feature.get('title_prefix');
        }
        window.location.href = this.urlService.buildDocumentUrl(
          module, id, /** @type {appx.DocumentLocale} */ (locale));
      } else if (source === 'biodivsports') {
        this.modal_.open({
          animation: true,
          size: 'sm',
          templateUrl: '/static/partials/map/biodivsportsinfo.html',
          controller: 'BiodivSportsModalController',
          controllerAs: 'modalCtrl',
          resolve: {
            'title': () => feature.get('title'),
            'description': () => feature.get('description'),
            'infoUrl': () => feature.get('info_url'),
            'kmlUrl': () => feature.get('kml_url'),
            'period': () => feature.get('period')
          }
        });
      }
    }
  }


  /**
   * @param {ol.MapBrowserEvent} event
   * @private
   */
  handleMapFeatureHover_(event) {
    if (event.dragging) {
      return;
    }
    const pixel = this.map.getEventPixel(event.originalEvent);
    const hit = this.map.hasFeatureAtPixel(pixel, function(layer) {
      // test only features from the current vector layer
      return layer === this.getVectorLayer_();
    }, this);
    this.map.getTarget().style.cursor = hit ? 'pointer' : '';

    if (hit) {
      const feature = this.map.forEachFeatureAtPixel(pixel, feature => feature, this, function(layer) {
        // test only features from the current vector layer
        return layer === this.getVectorLayer_();
      }, this);
      if (this.currentSelectedFeatureId_) {
        // reset any feature that was highlighted previously
        this.toggleFeatureHighlight_(this.currentSelectedFeatureId_, false);
      }
      const id = /** @type {number|string} */ (feature.getId());
      this.toggleFeatureHighlight_(id, true);
      this.scope_.$root.$emit('mapFeatureHover', id);
    } else if (this.currentSelectedFeatureId_) {
      // if a feature was highlighted but no longer hovered
      this.toggleFeatureHighlight_(this.currentSelectedFeatureId_, false);
      this.scope_.$root.$emit('mapFeatureHover', null);
    }
  }


  /**
   * @param {boolean} enabled Whether the map filter is enabled or not.
   * @param {boolean} was_enabled Former value.
   * @private
   */
  handleMapFilterSwitchChange_(
    enabled, was_enabled) {
    if (enabled === was_enabled) {
      // initial setting of the filter switch
      // * do nothing if the filter is enabled by default
      //   (request is triggered later)
      // * trigger a request if disabled by default
      //   (no request is triggered later)
      if (!enabled) {
        this.scope_.$root.$emit('searchFilterChange');
      }
      return;
    }
    if (enabled) {
      this.handleMapSearchChange_();
    } else {
      this.location_.deleteFragmentParam('bbox');
      this.location_.deleteFragmentParam('offset');
      this.scope_.$root.$emit('searchFilterChange');
    }
  }


  /**
   * @private
   */
  addTrackImporter_() {
    const dragAndDropInteraction = new olInteractionDragAndDrop({
      formatConstructors: [
        olFormatGPX
      ]
    });
    dragAndDropInteraction.on('addfeatures', (event) => {
      const features = event.features;
      if (features.length) {
        this.handleFeaturesUpload_(null, features);
      }
    });
    this.map.addInteraction(dragAndDropInteraction);
  }


  /**
   * @param {ol.Feature} feature Feature to process.
   * @return {ol.Feature}
   * @private
   */
  simplifyFeature_(feature) {
    let geometry = feature.getGeometry();
    goog.asserts.assert(geometry !== undefined);
    // simplify geometry with a tolerance of 20 meters
    geometry = this.simplifyService_.simplify(geometry, 20);
    feature.setGeometry(geometry);
    return feature;
  }


  /**
   * @export
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.scope_.$apply();
      this.map.renderSync();
      this.map.updateSize();
    }, 0);
  }

  /**
   * @export
   */
  canReset() {
    return this.edit;
  }


  /**
   * @export
   */
  resetFeature() {
    if (this.isDrawing_) {
      this.draw_.finishDrawing();
    }
    const source = this.getVectorLayer_().getSource();
    source.clear();

    this.scope_.$root.$emit('mapFeaturesReset', angular.copy(this.initialGeometry_));
  }


  /**
   * @export
   */
  canDelete() {
    return this.edit && this.getVectorLayer_().getSource().getFeatures().length > 0 &&
        this.initialGeometry_ && this.initialGeometry_['geom'];
  }


  /**
   * @export
   */
  deleteFeature() {
    if (this.isDrawing_) {
      this.draw_.finishDrawing();
    }
    const source = this.getVectorLayer_().getSource();
    source.clear();
    this.scope_.$root.$emit('mapFeaturesChange', []);
  }


  /**
   * @private
   */
  resizeMap_() {
    this.map.renderSync();
    this.map.updateSize();
  }
}
