import olAttribution from 'ol/control/Attribution';
import olLayerTile from 'ol/layer/Tile';
import olExtent from 'ol/extent';
import olProj from 'ol/proj';
import olSourceBingMaps from 'ol/source/BingMaps';
import olSourceWMTS from 'ol/source/WMTS';
import olSourceXYZ from 'ol/source/XYZ';
import olTilegridWMTS from 'ol/tilegrid/WMTS';

/**
 * @constructor
 * @param {ngeo.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer
 *   manager.
 * @param {app.Authentication} AuthenticationService
 * @param {appx.mapApiKeys} mapApiKeys Set of map API keys.
 * @ngInject
 * @export
 */
export default class LayertreeSelectorController {
  constructor(ngeoBackgroundLayerMgr, mapApiKeys) {
    'ngInject';

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
    this.tree = {
      'name': 'Root',
      'children': [{
        'name': 'Base layer',
        'children': [{
          'name': 'esri',
          'type': 'background'
        }, {
          'name': 'opentopomap',
          'type': 'background'
        }, {
          'name': 'bing',
          'type': 'background'
        }, {
          'name': 'ign maps',
          'type': 'background'
        }, {
          'name': 'ign ortho',
          'type': 'background'
        }, {
          'name': 'swisstopo',
          'type': 'background',
          'auth': true
        }]
      }, {
        'name': 'Slopes',
        'children': [{
          'name': 'ign slopes'
        }, {
          'name': 'swisstopo slopes',
          'auth': true
        }]
      }]
    };
  }

  $onInit() {
    /**
     * @type {Object|null}
     * @export
     */
    this.bgLayer = this.setBgLayer(this.tree.children[0].children[0]);
  }

  /**
   * Function called by the ngeo-layertree directives to create a layer
   * from a tree node. The function should return `null` if no layer should
   * be associated to the node (because it's not a leaf).
   * @param {Object} node Node object.
   * @return {ol.layer.Layer} The layer for this node.
   * @export
   */
  getLayer(node) {
    return this.createLayer_(node);
  }

  /**
   * Function called when the user selects a new background layer in the
   * dropdown. Called by the ng-click directive used in the partial.
   * @param {Object} layerSpec Layer specification object.
   * @export
   */
  setBgLayer(layerSpec) {
    this.currentBgLayerSpec = layerSpec;
    const layer = this.createLayer_(layerSpec);
    if (layer) {
      this.bgLayerMgr_.set(this.map, layer);
      this.bgLayer = layerSpec;
      return layerSpec;
    }
    return null;
  }

  /**
   * @param {Object} layerSpec Layer specification object.
   * @return {ol.layer.Tile} The layer.
   * @private
   */
  createLayer_(layerSpec) {
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
        source = new olSourceBingMaps({
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
    const layer = new olLayerTile({source: source});
    if (layerSpec['type'] !== 'background') {
      layer.setOpacity(0.4);
    }
    this.cachedLayers_[layerName] = layer;
    return layer;
  }


  /**
   * @param {string} layer IGN layer name.
   * @return {ol.source.WMTS}
   * @private
   */
  createIgnSource_(layer, format = 'jpeg') {
    const resolutions = [];
    const matrixIds = [];
    const proj3857 = olProj.get('EPSG:3857');
    const maxResolution = olExtent.getWidth(proj3857.getExtent()) / 256;

    for (let i = 0; i < 18; i++) {
      matrixIds[i] = i.toString();
      resolutions[i] = maxResolution / Math.pow(2, i);
    }

    const tileGrid = new olTilegridWMTS({
      origin: [-20037508, 20037508],
      resolutions: resolutions,
      matrixIds: matrixIds
    });

    return new olSourceWMTS({
      url: '//wxs.ign.fr/' + this.ignApiKey_ + '/wmts',
      layer: layer,
      matrixSet: 'PM',
      format: `image/${format}`,
      projection: 'EPSG:3857',
      tileGrid: tileGrid,
      style: 'normal',
      attributions: [new olAttribution({
        html: '<a href="http://www.geoportail.fr/" target="_blank">' +
            '<img src="//api.ign.fr/geoportail/api/js/latest/' +
            'theme/geoportal/img/logo_gp.gif"></a>'
      })]
    });
  }


  /**
   * @param {string} layer Swisstopo layer name.
   * @return {ol.source.XYZ}
   * @private
   */
  createSwisstopoSource_(layer, format = 'jpeg', time = 'current') {
    return new olSourceXYZ({
      attributions: [
        new olAttribution({
          html: '<a target="_blank" href="http://www.swisstopo.admin.ch">swisstopo</a>'
        })
      ],
      urls: ['10', '11', '12', '13', '14'].map(i => {
        return `https://wmts${i}.geo.admin.ch/1.0.0/${layer}/default/${time}/3857/{z}/{x}/{y}.${format}`;
      }),
      maxZoom: 17
    });
  }


  /**
   * @return {ol.source.XYZ}
   * @private
   */
  createEsriSource_() {
    return new olSourceXYZ({
      attributions: [
        new olAttribution({
          html: '<a href="https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f"' +
            ' target="_blank">Esri</a>'
        })
      ],
      url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/WMTS?' +
        'layer=World_Topo_Map&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&' +
        'Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}'
    });
  }

  /**
   * @return {ol.source.XYZ}
   * @private
   */
  createOpenTopoMapSource_() {
    return new olSourceXYZ({
      attributions: [
        new olAttribution({
          html: '© <a href="//openstreetmap.org/copyright">OpenStreetMap</a> | ' +
                '© <a href="//opentopomap.org" target="_blank">OpenTopoMap</a>'
        })
      ],
      url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
    });
  }
}
