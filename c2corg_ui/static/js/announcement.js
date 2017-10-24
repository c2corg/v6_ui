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
    link: function(scope, element, attrs) {
      scope.type = attrs.type;
    },
    templateUrl: '/static/partials/announcement.html'
  };
};
app.module.directive('appAnnouncement', app.announcementDirective);

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {app.Api} appApi Api service.
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 * @struct
 */

app.AnnouncementController = function($scope,appApi, appLang) {

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {app.Api}
   * @public
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
  this.visible = false;

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

  this.getAnnouncementFromForum();
};

/**
 * Get the announcement on the forum with the good language
 * @export
 */
app.AnnouncementController.prototype.getAnnouncementFromForum = function() {
  this.api.readAnnouncement(this.lang_.getLang()).then(function(response) {
    this.handleAnnouncement(response);
  }.bind(this), function() {
  }.bind(this));
};

/**
 * Handles announcement processing
 * the announcement is displayed if the post has the visible tag
 * @param response
 * @public
 */
app.AnnouncementController.prototype.handleAnnouncement = function(response) {
  var data = response['data'];
  if (data['tags'].indexOf('visible') > -1) {
    this.hasAnnouncement = true;
    this.text = data['post_stream']['posts'][0]['cooked'];
  }
};

/**
 * @export
 */
app.AnnouncementController.prototype.toggle = function() {
  this.visible = !this.visible;
};

app.module.controller('appAnnouncementController', app.AnnouncementController);
