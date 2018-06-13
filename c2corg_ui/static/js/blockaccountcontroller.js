/**
 * @module app.BlockAccountController
 */
import appBase from './index.js';

/**
 * @param {app.Authentication} appAuthentication
 * @param {app.Api} ApiService Api service.
 * @constructor
 * @ngInject
 * @struct
 */
const exports = function(appAuthentication, ApiService) {

  /**
   * @type {app.Api}
   * @private
   */
  this.apiService_ = ApiService;

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
    this.apiService_.isAccountBlocked(this.userId).then((response) => {
      this.accountBlocked = response['data']['blocked'];
    });
  }
};


/**
 * @export
 */
exports.prototype.block = function() {
  this.apiService_.blockAccount(this.userId).then((response) => {
    this.accountBlocked = true;
  });
};


/**
 * @export
 */
exports.prototype.unblock = function() {
  this.apiService_.unblockAccount(this.userId).then((response) => {
    this.accountBlocked = false;
  });
};

appBase.module.controller('appBlockAccountController', exports);


export default exports;
