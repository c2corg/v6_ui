/**
 * @module app.Api
 */
import appBase from './index.js';

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
const exports = function(discourseUrl, apiUrl, imageBackendUrl, $http, appAlerts, $q, appAuthentication) {

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
exports.prototype.postJson_ = function(url, json) {
  const config = {
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
exports.prototype.deleteJson_ = function(url, json) {
  const config = /** @type{angular.$http.Config} */ ({
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
exports.prototype.putJson_ = function(url, json) {
  const config = {
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
exports.prototype.getJson_ = function(url, cancelerPromise) {
  /** @type{angular.$http.Config} */
  const config = {
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
exports.prototype.associateDocument = function(parentId, childId) {
  const data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  const promise = this.postJson_('/associations', data);
  promise.catch((res) => {
    const msg = this.alerts_.gettext('Failed to associate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  });
  return promise;
};


/**
 * @param {number} parentId
 * @param {number} childId
 * @return {!angular.$q.Promise}
 */
exports.prototype.unassociateDocument = function(parentId, childId) {
  const data = {
    'parent_document_id': parentId,
    'child_document_id': childId
  };
  const promise = this.deleteJson_('/associations', data);
  promise.catch((res) => {
    const msg = this.alerts_.gettext('Failed to unassociate document:');
    this.alerts_.addErrorWithMsg(msg, res);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.logoutFromApiAndDiscourse = function() {
  const data = {
    'discourse': true
  };
  const promise = this.postJson_('/users/logout', data);
  promise.catch(function(response) {
    const msg = this.alerts_.gettext('Logout failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} module Module.
 * @param {Object} json Data.
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.createDocument = function(module, json) {
  const promise = this.postJson_('/' + module, json);
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
exports.prototype.readDocument = function(module, id, lang, editing) {
  const alerts = this.alerts_;
  editing = typeof editing === 'undefined' ? false : editing;
  const url = '/{module}/{id}?l={lang}{editing}'
    .replace('{module}', module)
    .replace('{id}', String(id))
    .replace('{lang}', lang)
    .replace('{editing}', editing ? '&e=1' : '');

  const promise = this.getJson_(url);
  promise.catch(response => {
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
exports.prototype.updateDocument = function(module, id, json) {
  const url = '/{module}/{id}'
    .replace('{module}', module)
    .replace('{id}', String(id));

  const promise = this.putJson_(url, json);
  promise.catch(this.errorSaveDocument_.bind(this));
  return promise;
};


/**
 * @param {string} module Module.
 * @param {string} qstr Filtering and paginating parameters.
 * @param {!angular.$q.Promise} cancelerPromise Promise to cancel the request
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.listDocuments = function(module, qstr, cancelerPromise) {
  const url = '/{module}{qmark}{qstr}'
    .replace('{module}', module)
    .replace('{qmark}', qstr ? '?' : '')
    .replace('{qstr}', qstr);
  const alerts = this.alerts_;
  const promise = this.getJson_(url, cancelerPromise);
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
exports.prototype.getDocumentByIdAndDoctype = function(id, doctype, lang) {
  const alerts = this.alerts_;
  const promise = this.getJson_('/search?q=' + id + '&t=' + doctype + '&pl=' + lang);
  promise.catch((response) => {
    alerts.addError(response);
  });
  return promise;
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
exports.prototype.errorSaveDocument_ = function(response) {
  let msg;
  if (response['data'] instanceof Object && 'errors' in response['data']) {
    msg = response;
  } else if (response['status'] === 403) {
    msg = 'You have no rights to edit this document.';
  } else if (response['status'] === 429) {
    msg = 'You have made too many changes recently and thus have been blocked';
  } else {
    msg = 'Failed saving the changes';
  }
  this.alerts_.addError(msg);
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.register = function(data) {
  const promise = this.postJson_('/users/register', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Registration failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.validateRegisterEmail = function(nonce) {
  const promise = this.postJson_('/users/validate_register_email/' + nonce, {});
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Your account could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.validateChangeEmail = function(nonce) {
  const promise = this.postJson_('/users/validate_change_email/' + nonce, {});
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Your new email could not be activated:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} email
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.requestPasswordChange = function(email) {
  const promise = this.postJson_('/users/request_password_change', {
    'email': email});
  promise.catch((response) => {
    const msg = this.alerts_.gettext('No email could be sent:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} nonce
 * @param {string} password
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.validateNewPassword = function(nonce, password) {
  const promise = this.postJson_('/users/validate_new_password/' + nonce, {
    'password': password
  });
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Password could not be changed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.login = function(data) {
  const promise = this.postJson_('/users/login', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Login failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.ssoLogin = function(data) {
  const promise = this.postJson_('/sso_login', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('SSO login failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.updatePreferredLanguage = function(lang) {
  const promise = this.postJson_('/users/update_preferred_language', {
    'lang': lang});
  promise.catch((response) => {
    this.alerts_.addError(response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readLatestForumTopics = function() {
  const config = {
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
exports.prototype.readAnnouncement = function(lang) {
  const config = {
    headers: {
      'Accept': 'application/json'
    }
  };

  const promise = this.http_.get(this.discourseUrl_ + '/t/annonce-' + lang + '.json', config);
  return promise;
};

/**
 * @param {undefined | string} token
 * @param {string} lang
 * @param {?number} userId
 * @param {boolean} isPersonal
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readFeed = function(token, lang, userId, isPersonal) {
  let url;
  const params = {'pl': lang};
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

  const promise = this.getJson_(url + '?' + $.param(params));
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting feed data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {undefined | string} token
 * @param {?number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readWhatsnewFeed = function(token, userId) {
  const params = {};
  if (token) {
    params['token'] = token;
  }
  if (userId) {
    params['u'] = userId;
  }

  const promise = this.getJson_('/documents/changes?' + $.param(params));
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting feed data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readAccount = function() {
  const promise = this.getJson_('/users/account');
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting account data failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.updateAccount = function(data) {
  const promise = this.postJson_('/users/account', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Updating account failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readPreferences = function() {
  const promise = this.getJson_('/users/preferences');
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.updatePreferences = function(data) {
  const promise = this.postJson_('/users/preferences', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Updating preferences failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readMailinglists = function() {
  const promise = this.getJson_('/users/mailinglists');
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting mailing lists failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {Object} data
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.updateMailinglists = function(data) {
  const promise = this.postJson_('/users/mailinglists', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Updating mailing lists failed:');
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
exports.prototype.uploadImage = function(file, canceller, progress) {
  const formData = new FormData();
  formData.append('file', file);

  const url = this.imageBackendUrl_ + '/upload';
  const promise = this.http_.post(url, formData, {
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
exports.prototype.createImages = function(files, document) {
  const documentType = appBase.utils.getDoctype(document.type);
  const associations = {};
  associations[documentType] = [{'document_id': document.document_id}];

  const images = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const image = file['metadata'];
    image['file_size'] = file['size'];
    image['associations'] = associations;
    image['locales'] = [{'lang': document.lang, 'title': image['title']}];

    images.push(image);
  }

  const promise = this.postJson_('/images/list', {'images': images});
  promise.catch(this.errorSaveDocument_.bind(this));
  promise['images'] = images;
  return promise;
};


/**
 * @param {number} document_id
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.readCommentsForum = function(document_id, lang) {
  const config = {
    headers: {
      'Accept': 'application/json'
    }
  };

  const urlTopics = this.discourseUrl_ + '/t/' + document_id + '-' + lang + '/' + document_id + '.json';
  const promise = this.http_.get(urlTopics, config);
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
exports.prototype.createTopic = function(document_id, lang) {
  const promise = this.postJson_('/forum/topics', {
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
exports.prototype.follow = function(user_id) {
  const data = {'user_id': user_id};
  const promise = this.postJson_('/users/follow', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Following user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} user_id
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.unfollow = function(user_id) {
  const data = {'user_id': user_id};
  const promise = this.postJson_('/users/unfollow', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Unfollowing user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} user_id
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.isFollowing = function(user_id) {
  const promise = this.getJson_('/users/following-user/' + user_id);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Checking if following user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.getFollowing = function() {
  const promise = this.getJson_('/users/following');
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Getting followed list failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.isAccountBlocked = function(userId) {
  const promise = this.getJson_('/users/blocked/' + userId);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Checking if user is blocked failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.blockAccount = function(userId) {
  const data = {'user_id': userId};
  const promise = this.postJson_('/users/block', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Blocking user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} userId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.unblockAccount = function(userId) {
  const data = {'user_id': userId};
  const promise = this.postJson_('/users/unblock', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Unblocking user failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.protectDocument = function(documentId) {
  const data = {'document_id': documentId};
  const promise = this.postJson_('/documents/protect', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Protecting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.unprotectDocument = function(documentId) {
  const data = {'document_id': documentId};
  const promise = this.postJson_('/documents/unprotect', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Unprotecting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} sourceDocumentId
 * @param {number} targetDocumentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.mergeDocuments = function(sourceDocumentId, targetDocumentId) {
  const data = {
    'source_document_id': sourceDocumentId,
    'target_document_id': targetDocumentId
  };
  const promise = this.postJson_('/documents/merge', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Merging documents failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.deleteDocument = function(documentId) {
  const promise = this.deleteJson_('/documents/delete/' + String(documentId), {});
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Deleting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


/**
 * @param {number} documentId
 * @param {string} lang
 * @return {!angular.$q.Promise<!angular.$http.Response>}
 */
exports.prototype.deleteLocale = function(documentId, lang) {
  const url = '/documents/delete/' + String(documentId) + '/' + lang;
  const promise = this.deleteJson_(url, {});
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Deleting locale failed:');
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
exports.prototype.revertDocument = function(documentId, lang, versionId) {
  const data = {
    'document_id': documentId,
    'lang': lang,
    'version_id': versionId
  };
  const promise = this.postJson_('/documents/revert', data);
  promise.catch((response) => {
    const msg = this.alerts_.gettext('Reverting document failed:');
    this.alerts_.addErrorWithMsg(msg, response);
  });
  return promise;
};


appBase.module.service('appApi', exports);


export default exports;
