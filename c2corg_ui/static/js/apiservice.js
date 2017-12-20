goog.provide('app.Api');

goog.require('app');


/**
 * Service for accessing the API.
 * @param {string} discourseUrl URL to the forum API.
 * @param {string} apiUrl URL to the API.
 * @param {string} imageBackendUrl URL to the image backend.
 * @param {angular.$http} $http
 * @param {app.Alerts} appAlerts The Alerts service
 * @param {angular.$q} $q
 * @param {app.Authentication} appAuthentication
 * @constructor
 * @struct
 * @ngInject
 */
app.Api = function(discourseUrl, apiUrl, imageBackendUrl, $http, appAlerts, $q, appAuthentication) {

  /**
   * @type {string}
   * @private
   */
  this.discourseUrl_ = discourseUrl;

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

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  const excludedCategories = [
    95,  // Partenaires : Escalade, SAE
    113, // Partenaires : Alpinisme, Cascade de glace
    94,  // Partenaires : Ski, Surf, Raquette, Randonnée
    96,  // Co-voiturage
    42,  // Annonces matos Rocher, SAE
    41,  // Annonces matos Glace, Neige, Mixte
    40,  // Annonces matos Ski, Surf, Raquette
    43,  // Annonces matos Divers (multiactivité, livres...)
    44,  // Autres annonces (gîtes, locations, fourgons...)
    45,  // Annonces de Professionnels
    97,  // Perdu / trouvé
    54,  // Bistrot
    47,  // Partenaires ++
    29,  // Commentaires des documents
    136, // V6 : suggestions, bugs et problèmes
    146, // Appli Mobile: suggestions, bugs...
    56,  // Modération : forums, topoguide, articles
    64,  // Traduction
    55   // V5 : suggestions, bugs et problèmes
  ];
  let url = `${this.discourseUrl_}latest.json?exclude_category_ids[]=${excludedCategories[0]}`;
  for (let i = 1; i < excludedCategories.length; i++) {
    url += `&exclude_category_ids[]=${excludedCategories[i]}`;
  }

  /**
   * @type {string}
   * @private
   */
  this.discourseLatestTopicsUrl = url;
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.postJson_ = function(url, json) {
  let config = {
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
  let config = /** @type{angular.$http.Config} */ ({
    data: json,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  });
  return this.http_.delete(this.apiUrl_ + url, config);
};


/**
 * @param {string} url Url suffix
 * @param {Object} json
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.putJson_ = function(url, json) {
  let config = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  };
  return this.http_.put(this.apiUrl_ + url, json, config);
};


/**
 * @param {string} url Url suffix
 * @param {!angular.$q.Promise=} cancelerPromise Promise to cancel the request
 * @return {!angular.$http.HttpPromise}
 * @private
 */
app.Api.prototype.getJson_ = function(url, cancelerPromise) {
  /** @type{angular.$http.Config} */
  let config = {
    headers: {
      'Accept': 'application/json'
    }
  };

  if (cancelerPromise) {
    config.timeout = cancelerPromise;
  }

  return this.http_.get(this.apiUrl_ + url, config);
};


/**
 * @param {number} parentId
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.associateDocument = function(parentId, childId) {
  let data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  let promise = this.postJson_('/associations', data);
  promise.catch((res) => {
    let msg = this.alerts_.gettext('Failed to associate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  });
  return promise;
};


/**
 * @param {number} parentId
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
app.Api.prototype.unassociateDocument = function(parentId, childId) {
  let data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  let promise = this.deleteJson_('/associations', data);
  promise.catch((res) => {
    let msg = this.alerts_.gettext('Failed to unassociate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.logoutFromApiAndDiscourse = function() {
  let data = {
    'discourse': true
  };
  let promise = this.postJson_('/users/logout', data);
  promise.catch(function(response) {
    let msg = this.alerts_.gettext('Logout failed:');
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
  let promise = this.postJson_('/' + module, json);
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
  let alerts = this.alerts_;
  editing = typeof editing === 'undefined' ? false : editing;
  let url = '/{module}/{id}?l={lang}{editing}'
    .replace('{module}', module)
    .replace('{id}', String(id))
    .replace('{lang}', lang)
    .replace('{editing}', editing ? '&e=1' : '');

  let promise = this.getJson_(url);
  promise.catch((response) => {
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
  let url = '/{module}/{id}'
    .replace('{module}', module)
    .replace('{id}', String(id));

  let promise = this.putJson_(url, json);
  promise.catch(this.errorSaveDocument_.bind(this));
  return promise;
};


/**
 * @param {string} module Module.
 * @param {string} qstr Filtering and paginating parameters.
 * @param {!angular.$q.Promise} cancelerPromise Promise to cancel the request
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.listDocuments = function(module, qstr, cancelerPromise) {
  let url = '/{module}{qmark}{qstr}'
    .replace('{module}', module)
    .replace('{qmark}', qstr ? '?' : '')
    .replace('{qstr}', qstr);
  let alerts = this.alerts_;
  let promise = this.getJson_(url, cancelerPromise);
  promise.catch((response) => {
    if (response.status !== -1) {
      // ignore errors when request was canceled
      alerts.addError(response);
    }
  });
  return promise;
};


/**
 * @export
 * @param {number} id Document id.
 * @param {string} doctype the first letter of document type (o, w, r...)
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.getDocumentByIdAndDoctype = function(id, doctype, lang) {
  let alerts = this.alerts_;
  let promise = this.getJson_('/search?q=' + id + '&t=' + doctype + '&pl=' + lang);
  promise.catch((response) => {
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
  let msg;
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
  let promise = this.postJson_('/users/register', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Registration failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateRegisterEmail = function(nonce) {
  let promise = this.postJson_('/users/validate_register_email/' + nonce, {});
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Your account could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateChangeEmail = function(nonce) {
  let promise = this.postJson_('/users/validate_change_email/' + nonce, {});
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Your new email could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} email
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.requestPasswordChange = function(email) {
  let promise = this.postJson_('/users/request_password_change', {
    'email': email});
  promise.catch((response) => {
    let msg = this.alerts_.gettext('No email could be sent:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @param {string} password
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.validateNewPassword = function(nonce, password) {
  let promise = this.postJson_('/users/validate_new_password/' + nonce, {
    'password': password
  });
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Password could not be changed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.login = function(data) {
  let promise = this.postJson_('/users/login', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Login failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.ssoLogin = function(data) {
  let promise = this.postJson_('/sso_login', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('SSO login failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updatePreferredLanguage = function(lang) {
  let promise = this.postJson_('/users/update_preferred_language', {
    'lang': lang});
  promise.catch((response) => {
    this.alerts_.addError(response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readLatestForumTopics = function() {
  let config = {
    headers: {
      'Accept': 'application/json'
    }
  };
  return this.http_.get(this.discourseLatestTopicsUrl, config);
};

/**
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readAnnouncement = function(lang) {
  let config = {
    headers: {
      'Accept': 'application/json'
    }
  };

  let promise = this.http_.get(this.discourseUrl_ + '/t/annonce-' + lang + '.json', config);
  return promise;
};

/**
 * @param {undefined | string} token
 * @param {string} lang
 * @param {?number} userId
 * @param {boolean} isPersonal
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readFeed = function(token, lang, userId, isPersonal) {
  let url;
  let params = {'pl': lang};
  if (token) {
    params['token'] = token;
  }

  if (userId) {
    url = '/profile-feed';
    params['u'] = userId;
  } else if (this.auth_.isAuthenticated() && isPersonal) {
    url = '/personal-feed';
  } else {
    url = '/feed';
  }

  let promise = this.getJson_(url + '?' + $.param(params));
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting feed data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {undefined | string} token
 * @param {?number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readWhatsnewFeed = function(token, userId) {
  let params = {};
  if (token) {
    params['token'] = token;
  }
  if (userId) {
    params['u'] = userId;
  }

  let promise = this.getJson_('/documents/changes?' + $.param(params));
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting feed data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readAccount = function() {
  let promise = this.getJson_('/users/account');
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting account data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updateAccount = function(data) {
  let promise = this.postJson_('/users/account', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Updating account failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readPreferences = function() {
  let promise = this.getJson_('/users/preferences');
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updatePreferences = function(data) {
  let promise = this.postJson_('/users/preferences', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Updating preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readMailinglists = function() {
  let promise = this.getJson_('/users/mailinglists');
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting mailing lists failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.updateMailinglists = function(data) {
  let promise = this.postJson_('/users/mailinglists', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Updating mailing lists failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {File} file
 * @param {!angular.$q.Promise} canceller
 * @param {function(ProgressEvent)} progress
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.uploadImage = function(file, canceller, progress) {
  let formData = new FormData();
  formData.append('file', file);

  let url = this.imageBackendUrl_ + '/upload';
  let promise = this.http_.post(url, formData, {
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
  let documentType = app.utils.getDoctype(document.type);
  let associations = {};
  associations[documentType] = [{'document_id': document.document_id}];

  let images = [];
  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    let image = file['metadata'];
    image['file_size'] = file['size'];
    image['associations'] = associations;
    image['locales'] = [{'lang': document.lang, 'title': image['title']}];

    images.push(image);
  }

  let promise = this.postJson_('/images/list', {'images': images});
  promise.catch(this.errorSaveDocument_.bind(this));
  promise['images'] = images;
  return promise;
};


/**
 * @param {number} document_id
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.readCommentsForum = function(document_id, lang) {
  let config = {
    headers: {
      'Accept': 'application/json'
    }
  };

  let urlTopics = this.discourseUrl_ + '/t/' + document_id + '-' + lang + '/' + document_id + '.json';
  let promise = this.http_.get(urlTopics, config);
  promise.catch((response) => {
    this.alerts_.addError(response);
  });
  return promise;
};


/**
 * @param {number} document_id
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.createTopic = function(document_id, lang) {
  let promise = this.postJson_('/forum/topics', {
    'document_id': document_id,
    'lang': lang
  });
  return promise.catch((response) => {
    this.errorSaveDocument_(response);
    return this.q_.reject(response);
  });
};


/**
 * @param {number} user_id
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.follow = function(user_id) {
  let data = {'user_id': user_id};
  let promise = this.postJson_('/users/follow', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Following user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} user_id
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.unfollow = function(user_id) {
  let data = {'user_id': user_id};
  let promise = this.postJson_('/users/unfollow', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Unfollowing user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} user_id
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.isFollowing = function(user_id) {
  let promise = this.getJson_('/users/following-user/' + user_id);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Checking if following user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.getFollowing = function() {
  let promise = this.getJson_('/users/following');
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Getting followed list failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.isAccountBlocked = function(userId) {
  let promise = this.getJson_('/users/blocked/' + userId);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Checking if user is blocked failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.blockAccount = function(userId) {
  let data = {'user_id': userId};
  let promise = this.postJson_('/users/block', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Blocking user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.unblockAccount = function(userId) {
  let data = {'user_id': userId};
  let promise = this.postJson_('/users/unblock', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Unblocking user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.protectDocument = function(documentId) {
  let data = {'document_id': documentId};
  let promise = this.postJson_('/documents/protect', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Protecting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.unprotectDocument = function(documentId) {
  let data = {'document_id': documentId};
  let promise = this.postJson_('/documents/unprotect', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Unprotecting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} sourceDocumentId
 * @param {number} targetDocumentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.mergeDocuments = function(sourceDocumentId, targetDocumentId) {
  let data = {
    'source_document_id': sourceDocumentId,
    'target_document_id': targetDocumentId
  };
  let promise = this.postJson_('/documents/merge', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Merging documents failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.deleteDocument = function(documentId) {
  let promise = this.deleteJson_('/documents/delete/' + String(documentId), {});
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Deleting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.deleteLocale = function(documentId, lang) {
  let url = '/documents/delete/' + String(documentId) + '/' + lang;
  let promise = this.deleteJson_(url, {});
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Deleting locale failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @param {string} lang
 * @param {number} versionId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
app.Api.prototype.revertDocument = function(documentId, lang, versionId) {
  let data = {
    'document_id': documentId,
    'lang': lang,
    'version_id': versionId
  };
  let promise = this.postJson_('/documents/revert', data);
  promise.catch((response) => {
    let msg = this.alerts_.gettext('Reverting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


app.module.service('appApi', app.Api);
