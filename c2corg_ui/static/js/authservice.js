goog.provide('app.Authentication');

goog.require('app');



/**
 * @param {string} apiUrl URL to the API.
 * @constructor
 */
app.Authentication = function(apiUrl) {

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {?Object}
   * @private
   */
  this.userData_ = null;
};


/**
 * @return {boolean}
 * @export
 */
app.Authentication.prototype.isAuthenticated = function() {
  var isAuth = !goog.object.isEmpty(this.getUserData_());
  if (isAuth && this.isExpired_()) {
    isAuth = false;
    this.removeUserData();
  }
  return isAuth;
};


/**
 * @param {Object} data User data returned by the login request.
 * @return {boolean} whether the operation succeeded.
 * @export
 */
app.Authentication.prototype.setUserData = function(data) {
  try {
    this.userData_ = data;
    window.localStorage.setItem('userData', JSON.stringify(data));
    return true;
  } catch (e) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
    // Either the storage is full or we are in incognito mode in a broken
    // browser.
    // TODO: display error message to user
    if (goog.DEBUG) {
      console.log('Fatal : failed to set authentication token', e);
    }
    return false;
  }
};


/**
 * @export
 */
app.Authentication.prototype.removeUserData = function() {
  window.localStorage.removeItem('userData');
  this.userData_ = null;
};


/**
 * @return {?Object}
 * @private
 */
app.Authentication.prototype.getUserData_ = function() {
  if (goog.isNull(this.userData_)) {
    var userData = window.localStorage.getItem('userData');
    this.userData_ = /** @type {Object} */
        (userData ? JSON.parse(userData) : {});
  }
  return this.userData_;
};


/**
 * @param {string} key Attribute to get from local storage.
 * @return {?string|Array}
 * @export
 */
app.Authentication.prototype.get = function(key) {
  return (key in this.getUserData_()) ? this.userData_[key] : null;
};


/**
 * @return {number}
 * @private
 */
app.Authentication.prototype.getExpire_ = function() {
  try {
    return parseInt(this.get('expire'), 10);
  } catch (e) {}
  return 0;
};


/**
 * @return {boolean}
 * @private
 */
app.Authentication.prototype.isExpired_ = function() {
  var now = Date.now() / 1000; // in sec
  var expire = this.getExpire_();
  return now > expire;
};


/**
 * Add authentication headers.
 * It may be the JWT token in the Authorization header or a CSRF token if
 * cookie based security is used (not implemented though).
 * @param {string} url Destination URL.
 * @param {!Object.<string>} headers Current headers.
 * @return {boolean} whether the operation was successful
 * @export
 */
app.Authentication.prototype.addAuthenticationHeaders = function(url,
    headers) {

  var token = this.get('token');
  if (token && !this.isExpired_()) {
    if (goog.DEBUG && url.indexOf('http://') === 0) {
      // FIXME: ideally, should prevent the operation in prod mode
      console.log('WARNING: added auth header to unsecure request to ' + url);
    }
    headers['Authorization'] = 'JWT token="' + token + '"';
    return true;
  }

  if (goog.DEBUG) {
    console.log('Application error, trying to authenticate request to ' +
        url + ' with missing or expired token');
  }
  return false;
};


/**
 * @param {string} method
 * @param {string} url
 * @return {boolean}
 * @export
 */
app.Authentication.prototype.needAuthorization = function(method, url) {
  // External URLs do not need auth.
  if (url.indexOf(this.apiUrl_) === -1) {
    return false;
  }
  // Login and register API URLs are obviously public.
  if (url.indexOf('/users/login') !== -1 ||
      url.indexOf('/users/register') !== -1) {
    return false;
  }
  // Figure write actions out using the HTTP method.
  // Read actions (GET) are generally public.
  return goog.array.contains(['POST', 'PUT', 'DELETE'], method);
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
