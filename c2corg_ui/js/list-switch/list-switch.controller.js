/**
 * @constructor
 * @ngInject
 */
export default class ListSwitchController {
  constructor() {
    'ngInject';

    /**
     * @type {boolean}
     * @export
     */
    this.showList = /** @type {boolean} */ (JSON.parse(window.localStorage.getItem('showList') || 'false'));
  }


  /**
   * @export
   */
  toggle() {
    this.showList = !this.showList;
    window.localStorage.setItem('showList', JSON.stringify(this.showList));
  }
}
