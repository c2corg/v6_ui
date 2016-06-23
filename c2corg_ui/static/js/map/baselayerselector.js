goog.provide('app.BaselayerSelectorController');
goog.provide('app.baselayerSelectorDirective');

goog.require('app');
goog.require('ngeo.BackgroundLayerMgr');
goog.require('ol.Attribution');
goog.require('ol.format.WMTSCapabilities');
goog.require('ol.layer.Tile');
goog.require('ol.source.BingMaps');
goog.require('ol.source.OSM');
goog.require('ol.source.WMTS');
goog.require('ol.tilegrid.WMTS');


/**
 * This directive is used to display a map baselayer selector.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.baselayerSelectorDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppBaselayerSelectorController',
    controllerAs: 'bglayerCtrl',
    bindToController: true,
    scope: {
      'map': '=appBaselayerSelectorMap'
    },
    templateUrl: '/static/partials/map/baselayerselector.html'
  };
};


app.module.directive('appBaselayerSelector', app.baselayerSelectorDirective);


/**
 * @param {angular.$http} $http
 * @param {ngeo.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer
 *     manager.
 * @param {appx.mapApiKeys} mapApiKeys Set of map API keys.
 * @param {app.Alerts} appAlerts
 * @param {app.Authentication} appAuthentication
 * @constructor
 * @export
 * @struct
 * @ngInject
 */
app.BaselayerSelectorController = function($http, ngeoBackgroundLayerMgr,
  mapApiKeys, appAlerts, appAuthentication) {

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {ngeo.BackgroundLayerMgr}
   * @private
   */
  this.bgLayerMgr_ = ngeoBackgroundLayerMgr;

  /**
   * @type {string}
   * @private
   */
  this.ignApiKey_ = mapApiKeys['ign'];

  /**
   * @type {string}
   * @private
   */
  this.bingApiKey_ = mapApiKeys['bing'];

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {ol.Map}
   * @export
   */
  this.map;

  /**
   * @type {Object<string, ol.layer.Tile>}
   * @private
   */
  this.cachedLayers_ = {};

  /**
   * @type {ol.format.WMTSCapabilities}
   * @private
   */
  this.wmtsParser_;

  /**
   * @type {Object}
   * @export
   */
  this.currentBgLayerSpec;

  /**
   * @type {Array.<Object>}
   * @export
   */
  this.bgLayerSpecs = app.BaselayerSelectorController.BG_LAYER_SPECS.filter(
    function(layer) {
      return appAuthentication.isAuthenticated() || !layer['auth'];
    }
  );

  this.setLayer(this.bgLayerSpecs[0]);
};


/**
 * @const
 * @type {Array.<Object>}
 */
app.BaselayerSelectorController.BG_LAYER_SPECS = [{
  'name': 'osm'
}, {
  'name': 'bing'
}, {
  'name': 'esri'
}, {
  'name': 'ign maps'
}, {
  'name': 'ign ortho'
}, {
  'name': 'swisstopo',
  'auth': true
}];


/**
 * Function called when the user selects a new background layer in the
 * dropdown. Called by the ng-click directive used in the partial.
 * @param {Object} layerSpec Layer specification object.
 * @export
 */
app.BaselayerSelectorController.prototype.setLayer = function(layerSpec) {
  this.currentBgLayerSpec = layerSpec;
  var layer = this.createLayer_(layerSpec['name']);
  if (layer) {
    this.bgLayerMgr_.set(this.map, layer);
  }
};


/**
 * @param {string} layerName Layer name.
 * @return {ol.layer.Tile} The layer.
 * @private
 */
app.BaselayerSelectorController.prototype.createLayer_ = function(layerName) {
  if (layerName in this.cachedLayers_) {
    return this.cachedLayers_[layerName];
  }
  var source, attributions;
  switch (layerName) {
    case 'esri':
      attributions = [new ol.Attribution({
        html: '<a href="https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f"' +
          ' target="_blank">Esri</a>'
      })];
      this.createWMTSLayerFromCapabilities_(
        'https://server.arcgisonline.com/arcgis/rest/services/' +
        'World_Topo_Map/MapServer/WMTS/1.0.0/WMTSCapabilities.xml', {
          'layer': 'World_Topo_Map',
          'matrixSet': 'GoogleMapsCompatible'
        }, 'esri', attributions);
      // layer creation is asynchronous
      return null;
    case 'bing':
      source = new ol.source.BingMaps({
        key: this.bingApiKey_,
        imagerySet: 'AerialWithLabels'
      });
      break;
    case 'ign maps':
      source = this.createIgnSource_('GEOGRAPHICALGRIDSYSTEMS.MAPS');
      break;
    case 'ign ortho':
      source = this.createIgnSource_('ORTHOIMAGERY.ORTHOPHOTOS');
      break;
    case 'swisstopo':
      attributions = [new ol.Attribution({
        html: '<a href="http://www.swisstopo.admin.ch/" target="_blank">swisstopo</a>'
      })];
      this.createWMTSLayerFromCapabilities_(
        'http://wmts10.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml', {
          'layer': 'ch.swisstopo.pixelkarte-farbe',
          'matrixSet': '3857',
          'projection': 'EPSG:3857',
          'requestEncoding': 'REST'
        }, 'swisstopo', attributions);
      // layer creation is asynchronous
      return null;
    case 'osm':
    default:
      source = new ol.source.OSM();
      break;
  }
  var layer = new ol.layer.Tile({source: source});
  this.cachedLayers_[layerName] = layer;
  return layer;
};


/**
 * @param {string} url URL of the WMTS capabilities file.
 * @param {Object} config Configuration properties for the layer.
 *   See ol.source.WMTS.optionsFromCapabilities for details.
 * @param {string} name Name of the layer in the baselayer selector.
 * @param {Array.<ol.Attribution>=} attributions Optional list of attributions.
 * @private
 */
app.BaselayerSelectorController.prototype.createWMTSLayerFromCapabilities_ = function(
    url, config, name, attributions) {
  this.http_.get(url).then(
    // success
    function(response) {
      this.wmtsParser_ = this.wmtsParser_ || new ol.format.WMTSCapabilities();
      var result = this.wmtsParser_.read(response.data);
      var options = ol.source.WMTS.optionsFromCapabilities(result, config);
      if (attributions) {
        options.attributions = attributions;
      }
      var layer = new ol.layer.Tile({
        source: new ol.source.WMTS(options)
      });
      this.cachedLayers_[name] = layer;
      this.bgLayerMgr_.set(this.map, layer);
    }.bind(this),
    // failure
    function(response) {
      this.alerts_.addError('Failed loading this map background');
    }.bind(this)
  );
};


/**
 * @param {string} layer IGN layer name.
 * @return {ol.source.WMTS}
 * @private
 */
app.BaselayerSelectorController.prototype.createIgnSource_ = function(layer) {
  var resolutions = [];
  var matrixIds = [];
  var proj3857 = ol.proj.get('EPSG:3857');
  var maxResolution = ol.extent.getWidth(proj3857.getExtent()) / 256;

  for (var i = 0; i < 18; i++) {
    matrixIds[i] = i.toString();
    resolutions[i] = maxResolution / Math.pow(2, i);
  }

  var tileGrid = new ol.tilegrid.WMTS({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds
  });

  return new ol.source.WMTS({
    url: '//wxs.ign.fr/' + this.ignApiKey_ + '/wmts',
    layer: layer,
    matrixSet: 'PM',
    format: 'image/jpeg',
    projection: 'EPSG:3857',
    tileGrid: tileGrid,
    style: 'normal',
    attributions: [new ol.Attribution({
      html: '<a href="http://www.geoportail.fr/" target="_blank">' +
          '<img src="//api.ign.fr/geoportail/api/js/latest/' +
          'theme/geoportal/img/logo_gp.gif"></a>'
    })]
  });
};


app.module.controller('AppBaselayerSelectorController', app.BaselayerSelectorController);
