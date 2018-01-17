goog.provide('app.BaselayerSelectorController');
goog.provide('app.baselayerSelectorDirective');

goog.require('app');
goog.require('ngeo.BackgroundLayerMgr');
goog.require('ol.Attribution');
goog.require('ol.layer.Tile');
goog.require('ol.source.BingMaps');
goog.require('ol.source.OSM');
goog.require('ol.source.WMTS');
goog.require('ol.source.XYZ');
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
    (layer) => {
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
  'name': 'esri'
}, {
  'name': 'opentopomap'
}, {
  'name': 'bing'
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
  const layer = this.createLayer_(layerSpec['name']);
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
  let source;
  switch (layerName) {
    case 'esri':
      source = this.createEsriSource_();
      break;
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
      source = this.createSwisstopoSource_('ch.swisstopo.pixelkarte-farbe');
      break;
    case 'opentopomap':
      source = this.createOpenTopoMapSource_();
      break;
    default:
      source = new ol.source.OSM();
      break;
  }
  const layer = new ol.layer.Tile({source: source});
  this.cachedLayers_[layerName] = layer;
  return layer;
};


/**
 * @param {string} layer IGN layer name.
 * @return {ol.source.WMTS}
 * @private
 */
app.BaselayerSelectorController.prototype.createIgnSource_ = function(layer) {
  const resolutions = [];
  const matrixIds = [];
  const proj3857 = ol.proj.get('EPSG:3857');
  const maxResolution = ol.extent.getWidth(proj3857.getExtent()) / 256;

  for (let i = 0; i < 18; i++) {
    matrixIds[i] = i.toString();
    resolutions[i] = maxResolution / Math.pow(2, i);
  }

  const tileGrid = new ol.tilegrid.WMTS({
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


/**
 * @param {string} layer Swisstopo layer name.
 * @return {ol.source.XYZ}
 * @private
 */
app.BaselayerSelectorController.prototype.createSwisstopoSource_ = function(layer) {
  return new ol.source.XYZ({
    attributions: [
      new ol.Attribution({
        html: '<a target="_blank" href="http://www.swisstopo.admin.ch/' +
        'internet/swisstopo/en/home.html">swisstopo</a>'
      })
    ],
    urls: ['10', '11', '12', '13', '14'].map((i) => {
      return 'https://wmts' + i + '.geo.admin.ch/1.0.0/' + layer + '/default/current' +
        '/3857/{z}/{x}/{y}.jpeg';
    }),
    maxZoom: 17
  });
};


/**
 * @return {ol.source.XYZ}
 * @private
 */
app.BaselayerSelectorController.prototype.createEsriSource_ = function() {
  return new ol.source.XYZ({
    attributions: [
      new ol.Attribution({
        html: '<a href="https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f"' +
          ' target="_blank">Esri</a>'
      })
    ],
    url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/WMTS?' +
      'layer=World_Topo_Map&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&' +
      'Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}'
  });
};

/**
 * @return {ol.source.XYZ}
 * @private
 */
app.BaselayerSelectorController.prototype.createOpenTopoMapSource_ = () => {
  return new ol.source.XYZ({
    attributions: [
      new ol.Attribution({
        html: '© <a href="//openstreetmap.org/copyright">OpenStreetMap</a> | ' +
              '© <a href="//opentopomap.org" target="_blank">OpenTopoMap</a>'
      })
    ],
    url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
  });
};


app.module.controller('AppBaselayerSelectorController', app.BaselayerSelectorController);
