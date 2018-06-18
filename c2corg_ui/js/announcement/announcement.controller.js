/**
 * @param {app.Api} ApiService Api service.
 * @param {app.Lang} LangService Lang service
 * @constructor
 * @ngInject
 * @struct
 */
export default class AnouncementConroller {
  constructor(ApiService, LangService) {
    'ngInject';

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {app.Lang}
     * @private
     */
    this.lang_ = LangService;

    /**
     * @type {boolean}
     * @export
     */
    this.isExpanded = false;

    /**
     * @type {boolean}
     * @export
     */
    this.canExpand = false;

    /**
     * @type {boolean}
     * @export
     */
    this.hasAnnouncement = false;

    /**
     * @type {string}
     * @export
     */
    this.text = '';

    this.getAnnouncementFromForum_();
  }

  /**
   * Get the announcement on the forum with the good language
   * @private
   */
  getAnnouncementFromForum_() {
    this.apiService_.readAnnouncement(this.lang_.getLang()).then((response) => {
      this.handleAnnouncement(response);
    });
  }

  /**
   * Handles announcement processing
   * the announcement is displayed if the post has the visible tag
   * @param response
   * @public
   */
  handleAnnouncement(response) {
    const data = response['data'];
    if (data['tags'].indexOf('visible') > -1) {
      this.hasAnnouncement = true;
      this.text = data['post_stream']['posts'][0]['cooked'];
      this.canExpand = $(this.text).filter('p').length > 1;
    }
  }

  /**
   * @export
   */
  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
