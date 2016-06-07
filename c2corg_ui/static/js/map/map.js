goog.provide('app.MapController');
goog.provide('app.mapDirective');

goog.require('app');
goog.require('app.utils');
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
goog.require('ol.interaction.Select');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
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
      'zoom': '@appMapZoom'
    },
    controller: 'AppMapController',
    controllerAs: 'mapCtrl',
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
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.MapController = function($scope, mapFeatureCollection, ngeoLocation,
  ngeoDebounce) {

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
    if (this.location_.hasParam('bbox')) {
      var bbox = this.location_.getParam('bbox');
      var extent = bbox.split(',');
      if (extent.length == 4) {
        this.initialExtent_ = extent.map(function(x) {
          return parseInt(x, 10);
        });
      }
    }

    this.scope_.$root.$on('searchFeaturesChange',
        this.handleSearchChange_.bind(this));

    this.view_.on('propertychange',
      ngeoDebounce(
        this.handleMapSearchChange_.bind(this),
        500, /* invokeApply */ true));
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
    this.getVectorLayer_().setStyle(this.createStyleFunction_(false));

    var pointerMoveInteraction = new ol.interaction.Select({
      style: this.createStyleFunction_(true),
      condition: ol.events.condition.pointerMove
    });
    this.map.addInteraction(pointerMoveInteraction);

    var clickInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click
    });
    clickInteraction.on('select', function(e) {
      /**
       * @type {ol.Collection.<ol.Feature>}
       */
      var features = e.target.getFeatures();
      if (features.getLength() > 0) {
        var first = features.item(0);
        var module = /** @type {string} */(first.get('module'));
        var id = first.get('documentId').toString();
        var lang = /** @type {string} */(first.get('lang'));
        var url = app.utils.buildDocumentUrl(module, id, lang);
        document.location = url;
      }
    }.bind(this));
    this.map.addInteraction(clickInteraction);
  }

  if (this.edit && this.drawType) {
    var vectorSource = this.getVectorLayer_().getSource();

    var draw = new ol.interaction.Draw({
      source: vectorSource,
      type: this.drawType
    });
    draw.on('drawend', this.handleDraw_.bind(this));
    this.map.addInteraction(draw);

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
  if (mapSize) {
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
 * @param {boolean} highlight
 * @return {ol.style.StyleFunction}
 * @private
 */
app.MapController.prototype.createStyleFunction_ = function(highlight) {
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
            return this.createPointStyle_(feature, resolution, highlight);
          case 'routes':
          case 'outings':
            return this.advancedSearch ?
              this.createPointStyle_(feature, resolution, highlight) :
              this.createLineStyle_(feature, resolution, highlight);
          default:
            return null;
        }
      }).bind(this);
};


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @param {boolean} highlight
 * @return {ol.style.Style|Array.<ol.style.Style>}
 * @private
 */
app.MapController.prototype.createPointStyle_ = function(feature,
    resolution, highlight) {

  var type = /** @type {string} */ (feature.get('module'));
  if (type === 'waypoints' && feature.get('type')) {
    type = /** @type {string} */ (feature.get('type'));
  }

  var id = /** @type {number} */ (feature.get('documentId'));
  var scale = highlight ? 1 : 0.5;
  var key = type + scale + '_' + id;
  var style = this.styleCache[key];
  if (!style) {
    var iconKey = type + scale;
    var icon = this.iconCache[iconKey];
    if (!icon) {
      icon = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        scale: scale,
        src: '/static/img/documents/' + type + '.svg'
      }));
      this.iconCache[iconKey] = icon;
    }

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

    style = new ol.style.Style({
      image: icon,
      text: text
    });
    this.styleCache[key] = style;
  }
  return style;
};


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @param {boolean} highlight
 * @return {ol.style.Style|Array.<ol.style.Style>}
 * @private
 */
app.MapController.prototype.createLineStyle_ = function(feature,
    resolution, highlight) {

  var key = 'lines' + (highlight ? ' _highlight' : '');
  var style = this.styleCache[key];
  if (!style) {
    var stroke = new ol.style.Stroke({
      color: highlight ? 'red' : 'yellow',
      width: 3
    });
    style = new ol.style.Style({
      stroke: stroke
    });
    this.styleCache[key] = style;
  }
  return style;
};


/**
 * @param {Array.<ol.Feature>} features Features to show.
 * @param {boolean} recenter Whether or not to recenter on the features.
 * @private
 */
app.MapController.prototype.showFeatures_ = function(features, recenter) {
  goog.asserts.assert(features.length > 0);
  var vectorLayer = this.getVectorLayer_();
  var source = vectorLayer.getSource();
  source.clear();
  source.addFeatures(features);

  if (recenter) {
    if (features.length == 1 &&
        features[0].getGeometry() instanceof ol.geom.Point) {
      var point = /** @type {ol.geom.Point} */ (features[0].getGeometry());
      this.view_.setCenter(point.getCoordinates());
      this.view_.setZoom(this.zoom || app.MapController.DEFAULT_POINT_ZOOM);
    } else {
      this.recenterOnExtent_(
        vectorLayer.getSource().getExtent(), {
          padding: [10, 10, 10, 10]
        });
    }
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
app.MapController.prototype.handleDraw_ = function(event) {
  var feature = event.feature;
  if (this.drawType == 'Point') {
    // Only one point can be drawn at a time
    var source = this.getVectorLayer_().getSource();
    goog.array.forEach(source.getFeatures(), function(f) {
      if (f !== feature) {
        this.removeFeature(f);
      }
    }, source);
  }
  this.scope_.$root.$emit('mapFeaturesChange', [feature]);
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
 * @private
 */
app.MapController.prototype.handleSearchChange_ = function(event, features) {
  // show the search results on the map but don't change the map extent
  this.showFeatures_(features, false);
};


/**
 * @param {ol.ObjectEvent} event
 * @private
 */
app.MapController.prototype.handleMapSearchChange_ = function(event) {
  if (this.initialExtent_) {
    // The map has just been set with an extent passed as permalink
    // => no need to set it again in the URL.
    this.initialExtent_ = null;
    this.scope_.$root.$emit('searchFilterChange');
  } else {
    var mapSize = this.map.getSize();
    if (mapSize) {
      var extent = this.view_.calculateExtent(mapSize);
      extent = extent.map(Math.floor);
      this.location_.updateParams({
        'bbox': extent.join(',')
      });
      this.location_.deleteParam('offset');
      this.scope_.$root.$emit('searchFilterChange');
    }
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


app.module.controller('AppMapController', app.MapController);
