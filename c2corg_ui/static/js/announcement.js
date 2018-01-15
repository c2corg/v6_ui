goog.provide('app.AnnouncementController');
goog.provide('app.announcementDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.announcementDirective = function() {
  return {
    restrict: 'E',
    controller: 'appAnnouncementController',
    controllerAs: 'announcementCtrl',
    templateUrl: '/static/partials/announcement.html'
  };
};
app.module.directive('appAnnouncement', app.announcementDirective);

/**
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 * @struct
 */

app.AnnouncementController = function(appApi, appLang) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api = appApi;

  /**
   * @type {app.Lang}
   * @private
   */
  this.lang_ = appLang;

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
};

/**
 * Get the announcement on the forum with the good language
 * @private
 */
app.AnnouncementController.prototype.getAnnouncementFromForum_ = function() {
  this.api.readAnnouncement(this.lang_.getLang()).then((response) => {
    this.handleAnnouncement(response);
  });
};

/**
 * Handles announcement processing
 * the announcement is displayed if the post has the visible tag
 * @param response
 * @public
 */
app.AnnouncementController.prototype.handleAnnouncement = function(response) {
  const data = response['data'];
  if (data['tags'].indexOf('visible') > -1) {
    this.hasAnnouncement = true;
    this.text = data['post_stream']['posts'][0]['cooked'];
    this.canExpand = $(this.text).filter('p').length > 1;
  }
};

/**
 * @export
 */
app.AnnouncementController.prototype.toggle = function() {
  this.isExpanded = !this.isExpanded;
};

app.module.controller('appAnnouncementController', app.AnnouncementController);
