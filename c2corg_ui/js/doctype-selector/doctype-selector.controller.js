/**
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @ngInject
 * @struct
 */
export default class DoctypeSelectorController {
  constructor(ngeoLocation) {
    'ngInject';

    /**
     * @type {ngeo.Location}
     * @private
     */
    this.location_ = ngeoLocation;

    /**
     * @type {string}
     * @export
     */
    this.defaultType;

    /**
     * @type {Array.<Object>}
     * @export
     */
    this.doctypes = [
      {'id': 'routes', 'name': 'Routes'},
      {'id': 'waypoints', 'name': 'Waypoints'},
      {'id': 'outings', 'name': 'Outings'},
      {'id': 'images', 'name': 'Images'},
      {'id': 'books', 'name': 'Books'},
      {'id': 'areas', 'name': 'Areas'}
    ];

    /**
     * @type {?Object}
     * @export
     */
    this.selected;

    this.doctypes.forEach((doctype) => {
      if (doctype['id'] === this.defaultType) {
        this.selected = doctype;
      }
    });

    /**
     * @type {Array.<string>}
     * @private
     */
    this.params_ = [];
  }


  /**
   * @export
   */
  redirect() {
    switch (this.selected['id']) {
      case 'outings':
      case 'routes':
      case 'images':
        this.setBbox_();
        this.setAreas_();
        this.setActivities_();
        break;
      case 'waypoints':
        this.setBbox_();
        this.setAreas_();
        break;
      case 'books':
        this.setActivities_();
        break;
      default:
        break;
    }
    let url = '/' + this.selected['id'];
    if (this.params_.length) {
      url += '#' + this.params_.join('&');
    }
    window.location = url;
  }


  /**
   * @private
   */
  setBbox_() {
    const bbox = this.location_.getFragmentParam('bbox');
    if (bbox) {
      this.params_.push('bbox=' + bbox);
    }
  }


  /**
   * @private
   */
  setAreas_() {
    const a = this.location_.getFragmentParam('a');
    if (a) {
      this.params_.push('a=' + a);
    }
  }


  /**
   * @private
   */
  setActivities_() {
    const act = this.location_.getFragmentParam('act');
    if (act) {
      this.params_.push('act=' + act);
    }
  }
}
