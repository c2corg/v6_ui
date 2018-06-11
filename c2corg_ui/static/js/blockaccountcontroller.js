/**
 * @module app.BlockAccountController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} appApi Api service.
 * @constructor
 * @ngInject
 * @struct
 */
const exports = function(appAuthentication, appApi) {

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
exports.prototype.block = function() {
  this.api_.blockAccount(this.userId).then((response) => {
    this.accountBlocked = true;
  });
};


/**
 * @export
 */
exports.prototype.unblock = function() {
  this.api_.unblockAccount(this.userId).then((response) => {
    this.accountBlocked = false;
  });
};

appBase.module.controller('appBlockAccountController', exports);


export default exports;
