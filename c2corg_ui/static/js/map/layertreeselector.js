goog.provide('app.LayertreeSelectorController');
goog.provide('app.layertreeSelectorDirective');

goog.require('app');
goog.require('ngeo.BackgroundLayerMgr');
/** @suppress {extraRequire} */
goog.require('ngeo.layertreeDirective');
goog.require('ol.Attribution');
goog.require('ol.layer.Tile');
goog.require('ol.source.BingMaps');
goog.require('ol.source.WMTS');
goog.require('ol.source.XYZ');
goog.require('ol.tilegrid.WMTS');

app.layertreeSelectorDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppLayertreeSelectorController',
    controllerAs: 'mapLayerCtrl',
    bindToController: true,
    scope: {
      'map': '=appLayertreeSelectorMap'
    },
    templateUrl: '/static/partials/map/layertreeselector.html'
  };
};

app.module.directive('appLayertreeSelector', app.layertreeSelectorDirective);

/**
 * @constructor
 * @param {ngeo.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer
 *   manager.
 * @param {app.Authentication} appAuthentication
 * @param {appx.mapApiKeys} mapApiKeys Set of map API keys.
 * @ngInject
 * @export
 */
app.LayertreeSelectorController = function(ngeoBackgroundLayerMgr,
  appAuthentication, mapApiKeys) {

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

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
   * @type {Object<string, ol.layer.Tile>}
   * @private
   */
  this.cachedLayers_ = {};

  /**
   * @type {Object}
   * @export
   */
  this.currentBgLayerSpec;

  /**
   * @type {Object|undefined}
   * @export
   */
  this.tree = this.createLayerTree_();

  /**
   * @type {Object|null}
   * @export
   */
  this.bgLayer = this.setBgLayer(this.tree.children[0].children[0]);
};

/**
 * Function called by the ngeo-layertree directives to create a layer
 * from a tree node. The function should return `null` if no layer should
 * be associated to the node (because it's not a leaf).
 * @param {Object} node Node object.
 * @return {ol.layer.Layer} The layer for this node.
 * @export
 */
app.LayertreeSelectorController.prototype.getLayer = function(node) {
  return this.createLayer_(node);
};

/**
 * Function called when the user selects a new background layer in the
 * dropdown. Called by the ng-click directive used in the partial.
 * @param {Object} layerSpec Layer specification object.
 * @export
 */
app.LayertreeSelectorController.prototype.setBgLayer = function(layerSpec) {
  this.currentBgLayerSpec = layerSpec;
  const layer = this.createLayer_(layerSpec);
  if (layer) {
    this.bgLayerMgr_.set(this.map, layer);
    this.bgLayer = layerSpec;
    return layerSpec;
  }
  return null;
};

/**
 * Build layer tree depending on user credentials.
 * @return {Object} The tree.
 * @private
 */
app.LayertreeSelectorController.prototype.createLayerTree_ = function() {
  let baseLayers = [{
    'name': 'esri',
    'type': 'background'
  }, {
    'name': 'opentopomap',
    'type': 'background'
  }, {
  /* TODO To be added back when Bing quota is reset
    'name': 'bing',
    'type': 'background'
  }, {
  */
    'name': 'ign maps',
    'type': 'background'
  }, {
    'name': 'ign ortho',
    'type': 'background'
  }, {
    'name': 'swisstopo',
    'type': 'background',
    'auth': true
  }];
  baseLayers = baseLayers.filter(
    layer => !layer['auth'] || this.auth_.isAuthenticated()
  );

  let slopeLayers = [{
    'name': 'ign slopes'
  }, {
    'name': 'swisstopo slopes',
    'auth': true
  }];
  slopeLayers = slopeLayers.filter(
    layer => !layer['auth'] || this.auth_.isAuthenticated()
  );

  return {
    'name': 'Root',
    'children': [{
      'name': 'Base layer',
      'children': baseLayers
    }, {
      'name': 'Slopes',
      'children': slopeLayers
    }]
  };
};

/**
 * @param {Object} layerSpec Layer specification object.
 * @return {ol.layer.Tile} The layer.
 * @private
 */
app.LayertreeSelectorController.prototype.createLayer_ = function(layerSpec) {
  const layerName = layerSpec['name'];
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
    case 'ign slopes':
      source = this.createIgnSource_('GEOGRAPHICALGRIDSYSTEMS.SLOPES.MOUNTAIN', 'png');
      break;
    case 'swisstopo':
      source = this.createSwisstopoSource_('ch.swisstopo.pixelkarte-farbe');
      break;
    case 'swisstopo slopes':
      source = this.createSwisstopoSource_('ch.swisstopo.hangneigung-ueber_30', 'png', '20160101');
      break;
    case 'opentopomap':
      source = this.createOpenTopoMapSource_();
      break;
    default:
      return null;
  }
  const layer = new ol.layer.Tile({source: source});
  if (layerSpec['type'] !== 'background') {
    layer.setOpacity(0.4);
  }
  this.cachedLayers_[layerName] = layer;
  return layer;
};


/**
 * @param {string} layer IGN layer name.
 * @return {ol.source.WMTS}
 * @private
 */
app.LayertreeSelectorController.prototype.createIgnSource_ = function(layer, format = 'jpeg') {
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
    format: `image/${format}`,
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
app.LayertreeSelectorController.prototype.createSwisstopoSource_ = function(layer, format = 'jpeg', time = 'current') {
  return new ol.source.XYZ({
    attributions: [
      new ol.Attribution({
        html: '<a target="_blank" href="http://www.swisstopo.admin.ch">swisstopo</a>'
      })
    ],
    urls: ['10', '11', '12', '13', '14'].map(i => {
      return `https://wmts${i}.geo.admin.ch/1.0.0/${layer}/default/${time}/3857/{z}/{x}/{y}.${format}`;
    }),
    maxZoom: 17
  });
};


/**
 * @return {ol.source.XYZ}
 * @private
 */
app.LayertreeSelectorController.prototype.createEsriSource_ = function() {
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
app.LayertreeSelectorController.prototype.createOpenTopoMapSource_ = () => {
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

app.module.controller('AppLayertreeSelectorController', app.LayertreeSelectorController);
