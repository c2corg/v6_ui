/**
 * @constructor
 * @ngInject
 */
export default class MapSwitchController {
  constructor() {
    'ngInject';

    /**
     * @type {boolean}
     * @export
     */
    this.hideMap = /** @type {boolean} */ (JSON.parse(window.localStorage.getItem('hideMap') || 'false'));
  }


  /**
   * @export
   */
  toggle() {
    this.hideMap = !this.hideMap;
    window.localStorage.setItem('hideMap', JSON.stringify(this.hideMap));
  }
}
