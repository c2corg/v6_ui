goog.provide('app.Authentication');

goog.require('app');



/**
 * @param {string} apiUrl URL to the API
 * @constructor
 */
app.Authentication = function(apiUrl) {
  this.apiUrl_ = apiUrl;
};


/**
 * @private
 * @return {string}
 */
app.Authentication.prototype.getToken_ = function() {
  return window.localStorage.getItem('auth_token') || '';
};


/**
 * @return {number}
 */
app.Authentication.prototype.getExpire = function() {
  try {
    return parseInt(window.localStorage.getItem('auth_expire'), 10);
  } catch (e) {}
  return 0;
};


/**
 * @return {boolean}
 */
app.Authentication.prototype.isExpired = function() {
  var now = new Date().getTime();
  var expire = this.getExpire();
  return now > expire;
};


/**
 * Add authentication headers.
 * It may be the JWT token in the Authorization header or a CSRF token if
 * cookie based security is used.
 * @param {string} url Destination URL.
 * @param {!Object.<string>} headers Current headers.
 * @return {boolean} whether the operation was successful
 */
app.Authentication.prototype.addAuthenticationHeaders = function(url,
    headers) {
  if (url.indexOf(this.apiUrl_) !== 0) {
    console.log('ERROR: only requests to API may have auth headers ' + url);
    return false;
  }
  var token = this.getToken_();
  if (token && !this.isExpired()) {
    if (url.indexOf('http://') === 0) {
      // FIXME: ideally, should prevent the operation in prod mode
      console.log('WARNING: added auth header to unsecure request to ' + url);
    }
    headers['Authorization'] = 'JWT token="' + token + '"';
    return true;
  }
  console.log('FIXME: application error, trying to authenticate request to ' +
      url + ' with missing or expired token');
  return false;
};


/**
 * @param {string} token Authentication token
 * @param {number} expire Expiration time in milliseconds, see
 * Date().getTime().
 * @return {boolean} whether the operation succeeded.
 */
app.Authentication.prototype.setToken = function(token, expire) {
  try {
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('auth_expire', expire.toString());
    return true;
  } catch (e) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
    // Either the storage is full or we are in incognito mode in a broken
    // browser.
    console.log('Fatal : failed to set authentication token', e);
    return false;
  }
};


/**
 * @param {string} method
 * @param {string} url
 * @return {boolean}
 */
app.Authentication.prototype.needAuthorization = function(method, url) {
  return (url.indexOf(this.apiUrl_) === 0) &&
      (method === 'POST' || method === 'PUT');
};


/**
 * @ngInject
 * @private
 * @param {string} apiUrl
 * @return {app.Authentication}
 */
app.AuthenticationFactory_ = function(apiUrl) {
  return new app.Authentication(apiUrl);
};
app.module.factory('appAuthentication', app.AuthenticationFactory_);
