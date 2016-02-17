goog.provide('app.Api');

goog.require('app');


/**
 * Service for accessing the API.
 * @param {string} apiUrl URL to the API.
 * @param {angular.$http} $http
 * @param {app.Alerts} appAlerts The Alerts service
 * @constructor
 * @struct
 * @ngInject
 */
app.Api = function(apiUrl, $http, appAlerts) {

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

  /**
   * @private
   */
  this.alerts_ = appAlerts;
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.postJson_ = function(url, json) {
  var config = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  };
  return this.http_.post(this.apiUrl_ + url, json, config);
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.deleteJson_ = function(url, json) {
  var config = {
    data: json,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  };
  return this.http_.delete(this.apiUrl_ + url, config);
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.putJson_ = function(url, json) {
  var config = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  };
  return this.http_.put(this.apiUrl_ + url, json, config);
};


/**
 * @param {string} url Url suffix
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.getJson_ = function(url) {
  var config = {
    headers: {
      'Accept': 'application/json'
    }
  };
  return this.http_.get(this.apiUrl_ + url, config);
};


/**
 * @param {number} parentId
 * @param {appx.SearchDocument} doc
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.associateDocument = function(parentId, doc) {
  var alerts = this.alerts_;
  var data = {
    'parent_document_id': parentId,
    'child_document_id': doc.document_id
  };

  return this.postJson_('/associations', data).catch(function() {
    var msg = alerts.gettext('Failed to associate document');
    alerts.addError(msg);
  });
}


/**
 * @param {number} parentId
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.unassociateDocument = function(parentId, childId) {
  var alerts = this.alerts_;
  var data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };

  return this.deleteJson_('/associations', data).catch(function() {
    var msg = alerts.gettext('Failed to unassociate document');
    alerts.addError(msg);
  });
}


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.logoutFromApiAndDiscourse = function() {
  var alerts = this.alerts_;
  var data = {
    'discourse': true
  };
  return this.postJson_('/users/logout', data).catch(function(response) {
    alerts.addError(response);
  });
};


/**
 * @param {string} module Module.
 * @param {Object} json Data.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.createDocument = function(module, json) {
  return this.postJson_('/' + module, json)
    .catch(this.errorSaveDocument_.bind(this));
};


/**
 * @param {string} module Module.
 * @param {number} id Document id.
 * @param {string} lang Language.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readDocument = function(module, id, lang) {
  var url = '/{module}/{id}?l={lang}'
    .replace('{module}', module)
    .replace('{id}', String(id))
    .replace('{lang}', lang);

  return this.getJson_(url).catch(function(response) {
    alerts.addError(response);
  });
};


/**
 * @param {string} module Module.
 * @param {number} id Document id.
 * @param {Object} json Data.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updateDocument = function(module, id, json) {
  var url = '/{module}/{id}'
    .replace('{module}', module)
    .replace('{id}', String(id));

  return this.putJson_(url, json)
    .catch(this.errorSaveDocument_.bind(this));
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.Api.prototype.errorSaveDocument_ = function(response) {
  // FIXME: API does not return a valid JSON response for 500/403 errors.
  // See https://github.com/c2corg/v6_api/issues/85
  var msg;
  if (response['data'] instanceof Object && 'errors' in response['data']) {
    msg = response;
  } else if (response['status'] == 403) {
    msg = 'You have no permission to modify this document';
  } else {
    msg = 'Failed saving the changes';
  }
  this.alerts_.addError(msg);
};


app.module.service('appApi', app.Api);
