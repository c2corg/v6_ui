goog.provide('app.Api');

goog.require('app');


/**
 * Service for accessing the API.
 * @param {string} apiUrl URL to the API.
 * @param {angular.$http} $http
 * @constructor
 * @struct
 * @ngInject
 */
app.Api = function(apiUrl, $http) {

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {angular.$http.HttpPromise}
 * @export
 */
app.Api.prototype.postJson = function(url, json) {
  var config = {
    'headers': {'Content-Type': 'application/json'}
  };
  return this.http_.post(this.apiUrl_ + url, json, config);
};


app.module.service('appApi', app.Api);
