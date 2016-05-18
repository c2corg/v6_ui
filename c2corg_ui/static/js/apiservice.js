goog.provide('app.Api');

goog.require('app');


/**
 * Service for accessing the API.
 * @param {string} apiUrl URL to the API.
 * @param {angular.$http} $http
 * @param {angular.$q} $q promise
 * @param {app.Alerts} appAlerts The Alerts service
 * @constructor
 * @struct
 * @ngInject
 */
app.Api = function(apiUrl, $http, appAlerts, $q) {

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
   * @type {angular.$q}
   * @private
   */
  this.q_ = $q;


  /**
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @private
   */
  this.uploadingImages_ = [];
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
 * @param {appx.SimpleSearchDocument} doc
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.associateDocument = function(parentId, doc) {
  var alerts = this.alerts_;
  var data = {
    'parent_document_id': parentId,
    'child_document_id': doc.document_id
  };

  var promise = this.postJson_('/associations', data);
  promise.catch(function() {
    var msg = alerts.gettext('Failed to associate document');
    alerts.addError(msg);
  });
  return promise;
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

  var promise = this.deleteJson_('/associations', data);
  promise.catch(function() {
    var msg = alerts.gettext('Failed to unassociate document');
    alerts.addError(msg);
  });
  return promise;
}


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.logoutFromApiAndDiscourse = function() {
  var alerts = this.alerts_;
  var data = {
    'discourse': true
  };
  var promise = this.postJson_('/users/logout', data);
  promise.catch(function(response) {
    alerts.addError(response);
  });
  return promise;
};


/**
 * @param {string} module Module.
 * @param {Object} json Data.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.createDocument = function(module, json) {
  var promise = this.postJson_('/' + module, json);
  promise.catch(this.errorSaveDocument_.bind(this));
  return promise;
};


/**
 * @param {string} module Module.
 * @param {number} id Document id.
 * @param {string} lang Language.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readDocument = function(module, id, lang) {
  var alerts = this.alerts_;
  var url = '/{module}/{id}?l={lang}'
    .replace('{module}', module)
    .replace('{id}', String(id))
    .replace('{lang}', lang);

  var promise = this.getJson_(url);
  promise.catch(function(response) {
    alerts.addError(response);
  });
  return promise;
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

  var promise = this.putJson_(url, json);
  promise.catch(this.errorSaveDocument_.bind(this));
  return promise;
};


/**
 * @param {string} module Module.
 * @param {string} qstr Filtering and paginating parameters.
 */
app.Api.prototype.listDocuments = function(module, qstr) {
  var url = '/{module}{qmark}{qstr}'
    .replace('{module}', module)
    .replace('{qmark}', qstr ? '?' : '')
    .replace('{qstr}', qstr);
  var alerts = this.alerts_;
  var promise = this.getJson_(url);
  promise.catch(function(response) {
    alerts.addError(response);
  });
  return promise;
};


/**
 * @export
 * @param {number} id Document id.
 * @param {string} doctype the first letter of document type (o, w, r...)
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.getDocumentByIdAndDoctype = function(id, doctype) {
  var alerts = this.alerts_;
  var promise = this.getJson_('/search?q=' + id + '&t=' + doctype);
  promise.catch(function(response) {
    alerts.addError(response);
  });
  return promise;
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


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.register = function(data) {
  var promise = this.postJson_('/users/register', data);
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateRegisterEmail = function(nonce) {
  var promise = this.postJson_('/users/validate_register_email/' + nonce, {});
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {string} email
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.requestPasswordChange = function(email) {
  var promise = this.postJson_('/users/request_password_change', {
    'email': email});
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {string} nonce
 * @param {string} password
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateNewPassword = function(nonce, password) {
  var promise = this.postJson_('/users/validate_new_password/' + nonce, {
    'password': password
  });
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.login = function(data) {
  var promise = this.postJson_('/users/login', data);
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updatePreferredLanguage = function(lang) {
  var promise = this.postJson_('/users/update_preferred_language', {
    'lang': lang});
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readAccount = function() {
  var promise = this.getJson_('/users/account');
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updateAccount = function(data) {
  var promise = this.postJson_('/users/account', data);
  promise.catch(function(response) {
    this.alerts_.addError(response);
  }.bind(this));
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.uploadImage = function(file) {
  var defer = this.q_.defer();
  this.uploadingImages_.push(defer);
  setInterval(function() {
    file['progress']++;
    defer.notify({'loaded': (file['progress'] / 100) * file['size'], 'total': file['size']}); // for the progress function
    if (file['progress'] >= 100) {
      file['metadata']['filename'] = '23259810.jpg';
      defer.resolve(file);
    }
  }, 30);
  return defer.promise;
};

/**
 * @param {Object} file
 */
app.Api.prototype.updateImageMetadata = function(file) {
  console.log('updating image')
  console.log(file)
};


/**
 * @param {number} index
 */
app.Api.prototype.abortUploadingImage = function(index) {
  console.log('abort uploading image')
};


/**
 * Saves the images and sends the metadatas (exif, title, server_file_name, activities...)
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 * @param {Array<File>} files
 */
app.Api.prototype.saveImages = function(files) {
  var defer = this.q_.defer();
  var metadatas = [];
  for (var i = 0; i < files.length; i++) {
    files[i]['metadata']['size'] = files[i]['size'];
    metadatas.push(files[i]['metadata']);
  }
  defer.resolve();
  console.log(metadatas);
  return defer.promise;
};

app.module.service('appApi', app.Api);
