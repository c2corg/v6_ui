goog.provide('app.blockAccountDirective');
goog.provide('app.BlockAccountController');

goog.require('app');
goog.require('app.Api');
goog.require('app.Authentication');


/**
 * @return {angular.Directive} The directive specs.
 */
app.blockAccountDirective = function() {
  return {
    restrict: 'A',
    controller: 'appBlockAccountController',
    controllerAs: 'blockCtrl',
    bindToController: {
      'userId': '=appUserId'
    },
    templateUrl: '/static/partials/blockaccount.html'
  };
};
app.module.directive('appBlockAccount', app.blockAccountDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @struct
 */
app.BlockAccountController = function(appAuthentication, appApi) {

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
  this.userId;

  /**
   * @type {boolean}
   * @export
   */
  this.accountBlocked = false;

  if (this.auth_.isModerator()) {
    this.api_.isAccountBlocked(this.userId).then((response) => {
      this.accountBlocked = response['data']['blocked'];
    });
  }
};


/**
 * @export
 */
app.BlockAccountController.prototype.block = function() {
  this.api_.blockAccount(this.userId).then((response) => {
    this.accountBlocked = true;
  });
};


/**
 * @export
 */
app.BlockAccountController.prototype.unblock = function() {
  this.api_.unblockAccount(this.userId).then((response) => {
    this.accountBlocked = false;
  });
};

app.module.controller('appBlockAccountController', app.BlockAccountController);
