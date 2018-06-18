/**
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 */
export default class ForumFeedController {
  constructor(ApiService) {
    'ngInject';

    /**
     * @type {Array.<Object>}
     * @export
     */
    this.topics = [];

    /**
     * @type {boolean}
     * @export
     */
    this.busyForum = true;

    /**
     * @type {boolean}
     * @export
     */
    this.errorForum = false;

    ApiService.readLatestForumTopics()
      .then(response => {
        this.busyForum = false;
        this.handleTopics_(response);
      })
      .catch(() => { // Error msg is shown in the api service
        this.busyForum = false;
        this.errorForum = true;
      });
  }


  /**
   * @param response
   * @private
   */
  handleTopics_(response) {
    const data = response['data'];
    this.errorForum = !('users' in data);
    if (!this.errorForum) {
      const postersAvatar = {};
      for (let j = 0, n = data['users'].length, user; j < n; j++) {
        user = data['users'][j];
        postersAvatar[user['username']] = user['avatar_template'].replace('{size}', '24');
      }

      for (let i = 0, l = data['topic_list']['topics'].length, topic; i < l; i++) {
        topic = data['topic_list']['topics'][i];
        topic['avatar_template'] = postersAvatar[topic['last_poster_username']];
        this.topics.push(topic);
      }
    }
  }
}
