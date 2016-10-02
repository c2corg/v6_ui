goog.provide('app.MapController');
goog.provide('app.mapDirective');

goog.require('app');
goog.require('app.utils');
goog.require('app.Url');
goog.require('ngeo.Debounce');
goog.require('ngeo.Location');
/** @suppress {extraRequire} */
goog.require('ngeo.mapDirective');
goog.require('ol.Collection');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
goog.require('ol.format.GPX');
goog.require('ol.geom.Point');
goog.require('ol.interaction.DragAndDrop');
goog.require('ol.interaction.Draw');
goog.require('ol.interaction.Modify');
goog.require('ol.interaction.MouseWheelZoom');
/** @suppress {extraRequire} */
goog.require('ol.interaction.Select');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Icon');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');
goog.require('ol.style.Text');


/**
 * This directive is used to display a pre-configured map in v6_ui pages.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.mapDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'edit': '=appMapEdit',
      'drawType': '@appMapDrawType',
      'disableWheel': '=appMapDisableWheel',
      'advancedSearch': '=appMapAdvancedSearch',
      'zoom': '@appMapZoom',
      'defaultMapFilter': '=appMapDefaultMapFilter',
      'showRecenterTools': '=appMapShowRecenterTools'
    },
    controller: 'AppMapController as mapCtrl',
    bindToController: true,
    templateUrl: '/static/partials/map/map.html'
  };
};


app.module.directive('appMap', app.mapDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features to show on the map.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @param {app.Url} appUrl URL service.
 * @param {string} imgPath Path to the image directory.
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.MapController = function($scope, mapFeatureCollection, ngeoLocation,
  ngeoDebounce, appUrl, imgPath) {

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
  this.defaultMapFilter;

  /**
   * @type {boolean}
   * @export
   */
  this.enableMapFilter = !!this.defaultMapFilter;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {ol.format.GeoJSON}
   * @private
   */
  this.geojsonFormat_ = new ol.format.GeoJSON();

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
   * @type {?number}
   * @private
   */
  this.currentSelectedFeatureId_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.ignoreExtentChange_ = false;

  /**
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
    view: new ol.View({
      center: ol.extent.getCenter(app.MapController.DEFAULT_EXTENT),
      zoom: app.MapController.DEFAULT_ZOOM
    })
  });

  /**
   * @type {ol.View}
   * @private
   */
  this.view_ = this.map.getView();

  // editing mode
  if (this.edit) {
    this.scope_.$root.$on('documentDataChange',
        this.handleEditModelChange_.bind(this));
    this.scope_.$root.$on('featuresUpload',
        this.handleFeaturesUpload_.bind(this));
    this.addTrackImporter_();
  }

  // advanced search mode
  if (this.advancedSearch) {
    if (this.location_.hasFragmentParam('bbox')) {
      this.enableMapFilter = true;
      var bbox = this.location_.getFragmentParam('bbox');
      var extent = bbox.split(',');
      if (extent.length == 4) {
        this.initialExtent_ = extent.map(function(x) {
          return parseInt(x, 10);
        });
      }
    } else {
      this.ignoreExtentChange_ = app.utils.detectDocumentIdFilter(this.location_);
    }

    this.scope_.$root.$on('searchFeaturesChange',
        this.handleSearchChange_.bind(this));
    this.scope_.$root.$on('cardEnter', function(event, id) {
      this.toggleFeatureHighlight_(id, true);
    }.bind(this));
    this.scope_.$root.$on('cardLeave', function(event, id) {
      this.toggleFeatureHighlight_(id, false);
    }.bind(this));

    this.view_.on('propertychange',
      ngeoDebounce(
        this.handleMapSearchChange_.bind(this),
        500, /* invokeApply */ true));

    this.scope_.$watch(function() {
      return this.enableMapFilter;
    }.bind(this), this.handleMapFilterSwitchChange_.bind(this));
  }

  if (!this.disableWheel) {
    var mouseWheelZoomInteraction = new ol.interaction.MouseWheelZoom();
    this.map.addInteraction(mouseWheelZoomInteraction);
    app.utils.setupSmartScroll(mouseWheelZoomInteraction);
  }

  if (mapFeatureCollection) {
    this.features_ = this.geojsonFormat_.readFeatures(mapFeatureCollection);
  }

  // add the features interactions
  if (this.features_.length > 0 || this.advancedSearch) {
    this.getVectorLayer_().setStyle(this.createStyleFunction_());
    this.map.on('click', this.handleMapFeatureClick_.bind(this));
    this.map.on('pointermove', this.handleMapFeatureHover_.bind(this));
  }

  if (this.edit && this.drawType) {
    var vectorSource = this.getVectorLayer_().getSource();

    this.draw_ = new ol.interaction.Draw({
      source: vectorSource,
      type: this.drawType
    });
    this.draw_.on('drawstart', this.handleDrawStart_.bind(this));
    this.draw_.on('drawend', this.handleDrawEnd_.bind(this));
    this.map.addInteraction(this.draw_);

    var modify = new ol.interaction.Modify({
      features: vectorSource.getFeaturesCollection(),
      // the SHIFT key must be pressed to delete vertices, so
      // that new vertices can be drawn at the same position
      // of existing vertices
      deleteCondition: function(event) {
        return ol.events.condition.shiftKeyOnly(event) &&
            ol.events.condition.singleClick(event);
      }
    });
    modify.on('modifyend', this.handleModify_.bind(this));
    this.map.addInteraction(modify);
  }

  // When the map is rendered:
  this.map.once('change:size', function(event) {
    if (this.features_.length > 0) {
      this.showFeatures_(this.features_, true);
    } else {
      var extent = this.initialExtent_ || app.MapController.DEFAULT_EXTENT;
      this.recenterOnExtent_(extent);
    }
  }.bind(this));
};


/**
 * @const
 * @type {Array.<number>}
 */
app.MapController.DEFAULT_EXTENT = [-400000, 5200000, 1200000, 6000000];


/**
 * @const
 * @type {number}
 */
app.MapController.DEFAULT_ZOOM = 4;


/**
 * @const
 * @type {number}
 */
app.MapController.DEFAULT_POINT_ZOOM = 12;


/**
 * @param {ol.Extent} extent Extent to recenter to.
 * @param {olx.view.FitOptions=} options Options.
 * @private
 */
app.MapController.prototype.recenterOnExtent_ = function(extent, options) {
  var mapSize = this.map.getSize();
  if (!mapSize || !ol.extent.getWidth(extent) || !ol.extent.getHeight(extent)) {
    this.view_.setCenter(ol.extent.getCenter(extent));
    this.view_.setZoom(this.zoom || app.MapController.DEFAULT_POINT_ZOOM);
  } else {
    options = options || {};
    this.view_.fit(extent, mapSize, options);
  }
};


/**
 * @return {ol.layer.Vector} Vector layer.
 * @private
 */
app.MapController.prototype.getVectorLayer_ = function() {
  if (!this.vectorLayer_) {
    // The Modify interaction requires the vector source is created
    // with an ol.Collection.
    var features = new ol.Collection();
    this.vectorLayer_ = new ol.layer.Vector({
      source: new ol.source.Vector({features: features})
    });

    // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
    // makes the vector layer "unmanaged", meaning that it is always on top.
    this.vectorLayer_.setMap(this.map);
  }
  return this.vectorLayer_;
};


/**
 * @return {ol.StyleFunction}
 * @private
 */
app.MapController.prototype.createStyleFunction_ = function() {
  return (
      /**
       * @param {ol.Feature|ol.render.Feature} feature
       * @param {number} resolution
       * @return {ol.style.Style|Array.<ol.style.Style>}
       */
      function(feature, resolution) {
        var module = /** @type {string} */ (feature.get('module'));
        switch (module) {
          case 'waypoints':
          case 'images':
            return this.createPointStyle_(feature, resolution);
          case 'routes':
          case 'outings':
            return this.advancedSearch ?
              this.createPointStyle_(feature, resolution) :
              this.createLineStyle_(feature, resolution);
          case 'areas':
            return this.createLineStyle_(feature, resolution);
          default:
            return null;
        }
      }).bind(this);
};


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 * @private
 */
app.MapController.prototype.createPointStyle_ = function(feature, resolution) {
  var module = feature.get('module');
  var path;
  var imgSize;
  var type = /** @type {string} */ (feature.get('module'));
  if (type === 'waypoints' && feature.get('type')) {
    type = /** @type {string} */ (feature.get('type'));
  }
  var id = /** @type {number} */ (feature.get('documentId'));
  var highlight = /** @type {boolean} */ (!!feature.get('highlight'));
  var scale = highlight ? 1 : 0.5;

  if (module === 'waypoints') {
    imgSize = highlight ? 40 : 24;
    path = '/documents/waypoints/' + type + '.svg';
  } else if (module === 'images') {
    imgSize = 0; // no circle for images
    path = '/documents/' + type + '.svg';
  } else {
    imgSize = highlight ? 32 : 16;
    path = '/documents/' + type + '.svg';
  }

  var key = type + scale + '_' + id;
  var styles = this.styleCache[key];
  if (!styles) {
    var iconKey = type + scale;
    var icon = this.iconCache[iconKey];
    if (!icon) {
      icon = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        scale: scale,
        src: this.imgPath_ + path
      }));
      this.iconCache[iconKey] = icon;
    }
    styles = [
      // render a transparent circle behind the actual icon so that selecting
      // is easier (the icons contain transparent areas that are not
      // selectable).
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: imgSize,
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.5)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ddd',
            width: 2
          })
        })
      }),
      new ol.style.Style({
        image: icon,
        text: this.createTextStyle_(feature, type, highlight)
      })
    ];
    this.styleCache[key] = styles;
  }
  return styles;
};


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 * @private
 */
app.MapController.prototype.createLineStyle_ = function(feature, resolution) {
  var type = /** @type {string} */ (feature.get('module'));
  var highlight = /** @type {boolean} */ (feature.get('highlight'));
  var id = /** @type {number} */ (feature.get('documentId'));
  var key = 'lines' + (highlight ? ' _highlight' : '') + '_' + id;
  var style = this.styleCache[key];
  if (!style) {
    var stroke = new ol.style.Stroke({
      color: highlight ? 'red' : 'yellow',
      width: 3
    });
    style = new ol.style.Style({
      text: this.createTextStyle_(feature, type, highlight),
      stroke: stroke
    });
    this.styleCache[key] = style;
  }
  return style;
};


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {string} type
 * @param {boolean} highlight
 * @return {ol.style.Text|undefined}
 */
app.MapController.prototype.createTextStyle_ = function(feature, type, highlight) {
  var text;
  if (highlight) { // on hover in list view
    var title = '';
    if (type === 'routes' && feature.get('title_prefix')) {
      title = feature.get('title_prefix') + ' : ';
    }
    title += feature.get('title');

    text = new ol.style.Text({
      text: app.utils.stringDivider(title, 30, '\n'),
      textAlign: 'left',
      offsetX: 20,
      font: '12px verdana,sans-serif',
      stroke: new ol.style.Stroke({
        color: 'white',
        width: 3
      }),
      fill: new ol.style.Fill({
        color: 'black'
      }),
      textBaseline: 'middle'
    });
  }
  return text;
};


/**
 * @param {Array.<ol.Feature>} features Features to show.
 * @param {boolean} recenter Whether or not to recenter on the features.
 * @private
 */
app.MapController.prototype.showFeatures_ = function(features, recenter) {
  var vectorLayer = this.getVectorLayer_();
  var source = vectorLayer.getSource();
  source.clear();

  if (!features.length) {
    if (recenter) {
      this.recenterOnExtent_(app.MapController.DEFAULT_EXTENT);
    }
    return;
  }

  features.forEach(function(feature) {
    var properties = feature.getProperties();
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
};


/**
 * @param {Object} event
 * @param {Object} data
 * @private
 */
app.MapController.prototype.handleEditModelChange_ = function(event, data) {
  if (!('geometry' in data && data['geometry'])) {
    return;
  }
  var geomattr = this.drawType == 'Point' ? 'geom' : 'geom_detail';
  var geomstr = data['geometry'][geomattr];
  var geometry;
  if (geomstr) {
    geometry = this.geojsonFormat_.readGeometry(geomstr);
    var features = [new ol.Feature(geometry)];
    this.showFeatures_(features, true);
  } else if (this.drawType != 'Point') {
    // recenter the map on the default point geometry for routes or outings
    // with no geom_detail
    geomstr = data['geometry']['geom'];
    geometry = /** @type {ol.geom.Point} */ (this.geojsonFormat_.readGeometry(geomstr));
    this.view_.setCenter(geometry.getCoordinates());
    this.view_.setZoom(this.zoom || app.MapController.DEFAULT_POINT_ZOOM);
  }
  if (!this.initialFeature_) {
    this.initialFeature_ = new ol.Feature(geometry.clone());
  }
};


/**
 * @param {Object} event
 * @param {Array.<ol.Feature>} features Uploaded features.
 * @private
 */
app.MapController.prototype.handleFeaturesUpload_ = function(event, features) {
  features.forEach(this.simplifyFeature_);
  this.showFeatures_(features, true);
  this.scope_.$root.$emit('mapFeaturesChange', features);
};


/**
 * @param {ol.interaction.DrawEvent} event
 * @private
 */
app.MapController.prototype.handleDrawStart_ = function(event) {
  this.isDrawing_ = true;
  var feature = event.feature;
  // Only one feature can be drawn at a time
  var source = this.getVectorLayer_().getSource();
  source.getFeatures().forEach(function(f) {
    if (f !== feature) {
      source.removeFeature(f);
    }
  });
};


/**
 * @param {ol.interaction.DrawEvent} event
 * @private
 */
app.MapController.prototype.handleDrawEnd_ = function(event) {
  this.isDrawing_ = false;
  this.scope_.$root.$emit('mapFeaturesChange', [event.feature]);
};


/**
 * @param {ol.interaction.ModifyEvent} event
 * @private
 */
app.MapController.prototype.handleModify_ = function(event) {
  var features = event.features.getArray();
  this.scope_.$root.$emit('mapFeaturesChange', features);
};


/**
 * @param {Object} event
 * @param {Array.<ol.Feature>} features Search results features.
 * @param {number} total Total number of results.
 * @param {boolean} recenter
 * @private
 */
app.MapController.prototype.handleSearchChange_ = function(event,
    features, total, recenter) {
  // show the search results on the map but don't change the map filter
  // if recentering on search results, the extent change must not trigger
  // a new search request.
  this.ignoreExtentChange_ = recenter;
  recenter = recenter || !this.enableMapFilter;
  this.showFeatures_(features, recenter);
};


/**
 * @param {number} id Feature id.
 * @param {boolean} highlight Whether the feature must be highlighted.
 * @private
 */
app.MapController.prototype.toggleFeatureHighlight_ = function(id, highlight) {
  var feature = this.getVectorLayer_().getSource().getFeatureById(id);
  if (feature) {
    this.currentSelectedFeatureId_ = highlight ? id : null;
    feature.set('highlight', highlight);
  }
};


/**
 * @private
 */
app.MapController.prototype.handleMapSearchChange_ = function() {
  if (!this.enableMapFilter) {
    return;
  }
  if (this.initialExtent_) {
    // The map has just been set with an extent passed as permalink
    // => no need to set it again in the URL.
    this.initialExtent_ = null;
    this.scope_.$root.$emit('searchFilterChange');
  } else {
    var mapSize = this.map.getSize();
    if (mapSize) {
      if (this.ignoreExtentChange_) {
        this.ignoreExtentChange_ = false;
        return;
      }
      var extent = this.view_.calculateExtent(mapSize);
      extent = extent.map(Math.floor);
      this.location_.updateFragmentParams({
        'bbox': extent.join(',')
      });
      this.location_.deleteFragmentParam('offset');
      this.scope_.$root.$emit('searchFilterChange');
    }
  }
};


/**
 * @param {ol.MapBrowserEvent} event
 * @private
 */
app.MapController.prototype.handleMapFeatureClick_ = function(event) {
  var feature = this.map.forEachFeatureAtPixel(event.pixel, function(feature) {
    return feature;
  }, this, function(layer) {
    // test only features from the current vector layer
    return layer === this.getVectorLayer_();
  }, this);
  if (feature) {
    var module = feature.get('module');
    var id = feature.get('documentId');
    var locale = {
      'lang': feature.get('lang'),
      'title': feature.get('title')
    };
    if (module === 'routes' && feature.get('title_prefix')) {
      locale['title_prefix'] = feature.get('title_prefix');
    }
    window.location.href = this.url_.buildDocumentUrl(
      module, id, /** @type {appx.DocumentLocale} */ (locale));
  }
};


/**
 * @param {ol.MapBrowserEvent} event
 * @private
 */
app.MapController.prototype.handleMapFeatureHover_ = function(event) {
  if (event.dragging) {
    return;
  }
  var pixel = this.map.getEventPixel(event.originalEvent);
  var hit = this.map.hasFeatureAtPixel(pixel, function(layer) {
    // test only features from the current vector layer
    return layer === this.getVectorLayer_();
  }, this);
  this.map.getTarget().style.cursor = hit ? 'pointer' : '';

  if (hit) {
    var feature = this.map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    }, this, function(layer) {
      // test only features from the current vector layer
      return layer === this.getVectorLayer_();
    }, this);
    if (this.currentSelectedFeatureId_) {
      // reset any feature that was highlighted previously
      this.toggleFeatureHighlight_(this.currentSelectedFeatureId_, false);
    }
    var id = /** @type {number} */ (feature.getId());
    this.toggleFeatureHighlight_(id, true);
    this.scope_.$root.$emit('mapFeatureHover', id);
  } else if (this.currentSelectedFeatureId_) {
    // if a feature was highlighted but no longer hovered
    this.toggleFeatureHighlight_(this.currentSelectedFeatureId_, false);
    this.scope_.$root.$emit('mapFeatureHover', null);
  }
};


/**
 * @param {boolean} enabled Whether the map filter is enabled or not.
 * @param {boolean} was_enabled Former value.
 * @private
 */
app.MapController.prototype.handleMapFilterSwitchChange_ = function(enabled,
    was_enabled) {
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
};


/**
 * @private
 */
app.MapController.prototype.addTrackImporter_ = function() {
  var dragAndDropInteraction = new ol.interaction.DragAndDrop({
    formatConstructors: [
      ol.format.GPX
    ]
  });
  dragAndDropInteraction.on('addfeatures', function(event) {
    var features = event.features;
    if (features.length) {
      features.forEach(this.simplifyFeature_);
      this.showFeatures_(features, true);
      this.scope_.$root.$emit('mapFeaturesChange', features);
    }
  }.bind(this));
  this.map.addInteraction(dragAndDropInteraction);
};


/**
 * @param {ol.Feature} feature Feature to process.
 * @return {ol.Feature}
 * @private
 */
app.MapController.prototype.simplifyFeature_ = function(feature) {
  var geometry = feature.getGeometry();
  // simplify geometry with a tolerance of 20 meters
  geometry = geometry.simplify(20);
  feature.setGeometry(geometry);
  return feature;
};


/**
 * @export
 */
app.MapController.prototype.resetFeature = function() {
  if (this.isDrawing_) {
    this.draw_.finishDrawing();
  }
  var source = this.getVectorLayer_().getSource();
  source.clear();
  var features = [];
  if (this.initialFeature_) {
    var feature = this.initialFeature_.clone();
    source.addFeature(feature);
    features.push(feature);
  }
  this.scope_.$root.$emit('mapFeaturesChange', features, true /* isReset */);
};


app.module.controller('AppMapController', app.MapController);
