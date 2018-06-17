/**
 * @constructor
 * @struct
 * @ngInject
 */
export default class ActivityFilterController {
  constructor() {
    'ngInject';

    /**
    * @type {Array.<string>}
    * @export
    */
    this.activities;

    /**
    * @type {Array.<appx.Document>}
    * @export
    */
    this.documents;

    /**
    * @type {Array.<string>}
    * @export
    */
    this.selectedActivities = [];
  }


  /**
  * @param {string} activity Activity to filter to.
  * @export
  */
  toggle(activity) {
    if (this.activities.indexOf(activity) != -1) {
      const index = this.selectedActivities.indexOf(activity);
      if (index == -1) {
        // activity is not already selected: add it to selection
        this.selectedActivities.push(activity);
      } else {
        // remove activity from selection
        this.selectedActivities.splice(index, 1);
      }
    }
  }


  /**
  * @param {appx.Document} doc Document to evaluate
  * @param {number} index
  * @param {Array.<appx.Document>} array Array of documents to filter
  * @return {boolean}
  * @private
  */
  filter_(doc, index, array) {
    if (!this.selectedActivities.length) {
      return true;
    }
    return doc.activities.some((activity) => {
      return this.selectedActivities.indexOf(activity) != -1;
    });
  }


  /**
  * @param {Array.<appx.Document>} docs
  * @return {Array.<appx.Document>}
  * @export
  */
  filter(docs) {
    return docs.filter(this.filter_.bind(this));
  }
}
