goog.provide('app.Api');

goog.require('app');


/**
 * Service for accessing the API.
 * @param {string} apiUrl URL to the API.
 * @param {string} imageBackendUrl URL to the image backend.
 * @param {angular.$http} $http
 * @param {app.Alerts} appAlerts The Alerts service
 * @param {angular.$q} $q
 * @constructor
 * @struct
 * @ngInject
 */
app.Api = function(apiUrl, imageBackendUrl, $http, appAlerts, $q) {

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {string}
   * @private
   */
  this.imageBackendUrl_ = imageBackendUrl;

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
   * @type {app.Alerts}
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
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.associateDocument = function(parentId, childId) {
  var data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  var promise = this.postJson_('/associations', data);
  promise.catch(function(res) {
    var msg = this.alerts_.gettext('Failed to associate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  }.bind(this));
  return promise;
};


/**
 * @param {number} parentId
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.unassociateDocument = function(parentId, childId) {
  var data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  var promise = this.deleteJson_('/associations', data);
  promise.catch(function(res) {
    var msg = this.alerts_.gettext('Failed to unassociate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  }.bind(this));
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.logoutFromApiAndDiscourse = function() {
  var data = {
    'discourse': true
  };
  var promise = this.postJson_('/users/logout', data);
  promise.catch(function(response) {
    var msg = this.alerts_.gettext('Logout failed:');
    this.alerts_.addErrorWithMsg(msg, response);
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
 * @param {boolean=} editing True if in editing mode (default: false).
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readDocument = function(module, id, lang, editing) {
  var alerts = this.alerts_;
  editing = typeof editing === 'undefined' ? false : editing;
  var url = '/{module}/{id}?l={lang}{editing}'
    .replace('{module}', module)
    .replace('{id}', String(id))
    .replace('{lang}', lang)
    .replace('{editing}', editing ? '&e=1' : '');

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
 * @return {!angular.$q.Promise<!angular.$http.Response>}
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
  } else if (response['status'] === 403) {
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
    var msg = this.alerts_.gettext('Registration failed:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('Your account could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
  }.bind(this));
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateChangeEmail = function(nonce) {
  var promise = this.postJson_('/users/validate_change_email/' + nonce, {});
  promise.catch(function(response) {
    var msg = this.alerts_.gettext('Your new email could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('No email could be sent:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('Password could not be changed:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('Login failed:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('Getting account data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
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
    var msg = this.alerts_.gettext('Updating account failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  }.bind(this));
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readPreferences = function() {
  var promise = this.getJson_('/users/preferences');
  promise.catch(function(response) {
    var msg = this.alerts_.gettext('Getting preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  }.bind(this));
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updatePreferences = function(data) {
  var promise = this.postJson_('/users/preferences', data);
  promise.catch(function(response) {
    var msg = this.alerts_.gettext('Updating preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  }.bind(this));
  return promise;
};


/**
 * @param {File} file
 * @param {!angular.$q.Promise} canceller
 * @param {function(ProgressEvent)} progress
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.uploadImage = function(file, canceller, progress) {
  var formData = new FormData();
  formData.append('file', file);

  var url = this.imageBackendUrl_ + '/upload';
  var promise = this.http_.post(url, formData, {
    headers: {
      'Content-Type': undefined
    },
    'timeout': canceller,
    'uploadEventHandlers': {
      progress: progress
    }
  });
  return promise;
};


/**
 * Saves the images and sends the metadatas (exif, title, server_file_name, activities...)
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 * @param {Array<File>} files
 */
app.Api.prototype.createImages = function(files, document) {
  var documentType = app.utils.getDoctype(document.type);
  var associations = {};
  associations[documentType] = [{'document_id': document.document_id}];
  var images = [];

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var meta = file['metadata'];
    var date = meta['DateTime'] ? meta['DateTime'].substring(0, 10).split(':') : null; // convert "2015:12:31 20:56:09"
    var image = meta;

    image['categories'] = meta['categories'];
    image['activities'] = meta['activities'];
    image['file_size'] = file['size'];
    image['exposure_time'] = meta['ExposureTime'];
    image['associations'] = associations;
    image['locales'] = [{'lang': document.lang, 'title': image['title']}];
    image['date_time'] = date ? date[0] + '-' + date[1] + '-' + date[2] : window.moment(new Date()).format('YYYY-MM-DD');
    image['iso_speed'] = meta['PhotographicSensitivity'];
    image['focal_legth'] = meta['FocalLengthIn35mmFilm'];
    image['fnumber'] = meta['FNumber'];
    image['camera_name'] = (meta['Make'] && meta['Model']) ? (meta['Make'] + ' ' + meta['Model']) : null;

    images.push(image);
  }

  var promise = this.postJson_('/images/list', {'images': images});
  promise.catch(this.errorSaveDocument_.bind(this));
  promise['images'] = images;
  return promise;
};


/**
 * @param {number} document_id
 * @param {string} lang
 */
app.Api.prototype.createTopic = function(document_id, lang) {
  var promise = this.postJson_('/forum/topics', {
    'document_id': document_id,
    'lang': lang
  });
  promise.catch(this.errorSaveDocument_.bind(this));
  return promise;
};


app.module.service('appApi', app.Api);
