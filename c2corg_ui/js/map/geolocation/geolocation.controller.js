import olStyleCircle from 'ol/style/Circle.js';
import olStyleFill from 'ol/style/Fill.js';
import olStyleStroke from 'ol/style/Stroke.js';
import olStyleStyle from 'ol/style/Style.js';

/**
 * @constructor
 * @struct
 * @ngInject
 */
export default class GeolocationController {
  constructor() {
    'ngInject';

    /**
     * @type {ol.Map}
     * @export
     */
    this.map;

    const positionFeatureStyle = new olStyleStyle({
      image: new olStyleCircle({
        radius: 6,
        fill: new olStyleFill({color: 'rgba(230, 100, 100, 1)'}),
        stroke: new olStyleStroke({color: 'rgba(230, 40, 40, 1)', width: 2})
      })
    });

    const accuracyFeatureStyle = new olStyleStyle({
      fill: new olStyleFill({color: 'rgba(100, 100, 230, 0.3)'}),
      stroke: new olStyleStroke({color: 'rgba(40, 40, 230, 1)', width: 2})
    });

    /**
     * @type {ngeox.MobileGeolocationDirectiveOptions}
     * @export
     */
    this.mobileGeolocationOptions = {
      positionFeatureStyle: positionFeatureStyle,
      accuracyFeatureStyle: accuracyFeatureStyle,
      zoom: 14
    };
  }
}
