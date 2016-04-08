goog.provide('app.MapController');
goog.provide('app.mapDirective');

goog.require('app');
goog.require('app.utils');
/** @suppress {extraRequire} */
goog.require('ngeo.mapDirective');
goog.require('ol.Collection');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
goog.require('ol.geom.Point');
goog.require('ol.interaction.Draw');
goog.require('ol.interaction.Modify');
goog.require('ol.interaction.MouseWheelZoom');
goog.require('ol.interaction.Select');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');
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
      'editCtrl': '=appMapEditCtrl',
      'drawType': '@appMapDrawType',
      'disableWheel': '=appMapDisableWheel'
    },
    controller: 'AppMapController',
    controllerAs: 'mapCtrl',
    bindToController: true,
    template: '<div class="map" ngeo-map=mapCtrl.map></div>'
  };
};


app.module.directive('appMap', app.mapDirective);


/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features
 * to show on the map.
 * @constructor
 * @export
 * @ngInject
 */
app.MapController = function($scope, mapFeatureCollection) {

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
   * @type {?app.DocumentEditingController}
   * @private
   */
  this.editCtrl_ = this['editCtrl'];
  if (this.editCtrl_) {
    this.scope_.$root.$on('documentDataChange',
        this.handleEditModelChange_.bind(this));
  }

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
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ]
  });

  if (!(this['disableWheel'] || false)) {
    var mouseWheelZoomInteraction = new ol.interaction.MouseWheelZoom();
    this.map.addInteraction(mouseWheelZoomInteraction);
    app.utils.setupSmartScroll(mouseWheelZoomInteraction);
  }

  if (mapFeatureCollection) {
    this.getVectorLayer_().setStyle(this.createStyleFunction_(false));

    var properties = mapFeatureCollection['properties'];
    var format = new ol.format.GeoJSON();
    this.features_ = format.readFeatures(mapFeatureCollection);

    var pointerMoveInteraction = new ol.interaction.Select({
      style: this.createStyleFunction_(true),
      condition: ol.events.condition.pointerMove
    });
    this.map.addInteraction(pointerMoveInteraction);

    if (properties && properties['enableClickInteraction']) {
      var clickInteraction = new ol.interaction.Select({
        condition: ol.events.condition.click
      });
      clickInteraction.on('select', function(e) {
        /**
         * @type {ol.Collection.<ol.Feature>}
         */
        var features = e.target.getFeatures();
        if (features.getLength() > 0) {
          var first = features.getArray()[0];
          var module = /** @type {string} */(first.get('module'));
          var id = first.get('documentId').toString();
          var lang = /** @type {string} */(first.get('lang'));
          var url = app.utils.buildDocumentUrl(module, id, lang);
          document.location = url;
        }
      }.bind(this));
      this.map.addInteraction(clickInteraction);
    }
  } else {
    this.map.setView(new ol.View({
      center: app.MapController.DEFAULT_CENTER,
      zoom: app.MapController.DEFAULT_ZOOM
    }));
  }

  if (this.drawType) {
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

  /**
   * @type {ol.View}
   * @private
   */
  this.view_ = this.map.getView();

  /**
   * @type {ol.format.GeoJSON}
   * @private
   */
  this.geojsonFormat_ = new ol.format.GeoJSON();

  if (!goog.array.isEmpty(this.features_)) {
    // Recentering on the features extent requires that the map actually
    // has a target. Else the map size cannot be computed.
    this.map.on('change:target', goog.bind(function() {
      this.showFeatures_(this.features_);
    }, this));
  }
};


/**
 * @const
 * @type {Array.<number>}
 */
app.MapController.DEFAULT_CENTER = [0, 0];


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
            return this.createWaypointStyle_(feature, resolution, highlight);
          case 'routes':
          case 'outings':
            return this.createLineStyle_(feature, resolution, highlight);
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
app.MapController.prototype.createWaypointStyle_ = function(feature,
    resolution, highlight) {

  var type = /** @type {string} */ (feature.get('type'));
  if (!type) {
    // skip this feature
    return null;
  }

  var id = /** @type {number} */ (feature.get('documentId'));
  var scale = highlight ? 2 : 1;
  var key = type + scale + '_' + id;
  var style = this.styleCache[key];
  if (!style) {
    var iconKey = type + scale;
    var icon = this.iconCache[iconKey];
    if (!icon) {
      icon = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        scale: scale,
        src: '/static/img/icons/' + type + '.png'
      }));
      this.iconCache[iconKey] = icon;
    }

    var text;
    if (scale > 1 && typeof id !== undefined) { // on hover in list view
      var title = /** @type {string} */(feature.get('title'));

      text = new ol.style.Text({
        text: title,
        textAlign: 'left',
        offsetX: 20,
        font: 'bold 14px Calibri,sans-serif',
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
 * @param {Array<ol.Feature>} features Features to show.
 * @private
 */
app.MapController.prototype.showFeatures_ = function(features) {
  goog.asserts.assert(features.length > 0);
  var vectorLayer = this.getVectorLayer_();
  var source = vectorLayer.getSource();
  source.clear();
  source.addFeatures(features);

  if (features.length == 1 &&
      features[0].getGeometry() instanceof ol.geom.Point) {
    var point = /** @type {ol.geom.Point} */ (features[0].getGeometry());
    this.view_.setCenter(point.getCoordinates());
    this.view_.setZoom(app.MapController.DEFAULT_POINT_ZOOM);
  } else {
    var mapSize = this.map.getSize() || null;
    this.view_.fit(vectorLayer.getSource().getExtent(), mapSize, {
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
  var geomstr = data['geometry'] ? data['geometry']['geom'] : null;
  if (geomstr) {
    var geometry = this.geojsonFormat_.readGeometry(geomstr);
    var features = [new ol.Feature(geometry)];
    this.showFeatures_(features);
  }
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
  this.scope_.$root.$emit('mapFeatureChange', feature);
};


/**
 * @param {ol.interaction.ModifyEvent} event
 * @private
 */
app.MapController.prototype.handleModify_ = function(event) {
  // TODO handle lines as well, not only points
  if (this.drawType != 'Point') {
    alert('Feature type not supported for editing');
    return;
  }
  var feature = event.features.item(0);
  this.scope_.$root.$emit('mapFeatureChange', feature);
};


app.module.controller('AppMapController', app.MapController);
