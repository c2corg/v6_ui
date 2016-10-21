goog.provide('app.FollowController');
goog.provide('app.followDirective');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');


/**
 * @return {angular.Directive} The directive specs.
 */
app.followDirective = function() {
  return {
    restrict: 'E',
    controller: 'appFollowController',
    controllerAs: 'followCtrl',
    bindToController: {
      'docId' : '=appFollowId'
    },
    templateUrl: '/static/partials/follow.html'
  };
};
app.module.directive('appFollow', app.followDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @export
 * @struct
 */
app.FollowController = function(appAuthentication, appApi) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {number}
   * @export
   */
  this.docId;

  /**
   * @type {boolean}
   * @export
   */
  this.followed = false;

  if (this.auth_.isAuthenticated()) {
    this.api_.isFollowing(this.docId).then(function(response) {
      this.followed = response['data']['is_following'];
    }.bind(this));
  }
};


/**
 * @export
 */
app.FollowController.prototype.canFollow = function() {
  // - only auth users may follow
  // - users may not follow themselves
  return this.auth_.isAuthenticated() && this.auth_.userData.id !== this.docId;
};


/**
 * @export
 */
app.FollowController.prototype.toggle = function() {
  if (this.followed) {
    this.api_.unfollow(this.docId).then(function(response) {
      this.followed = false;
    }.bind(this));
  } else {
    this.api_.follow(this.docId).then(function(response) {
      this.followed = true;
    }.bind(this));
  }
};


app.module.controller('appFollowController', app.FollowController);
