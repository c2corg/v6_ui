goog.provide('app.Document');

goog.require('app');


/**
 * This service is used to access the document properties
 * within other controllers, for example to set the properties in one
 * controller and then read them in another.
 * Also to do all functions common to all documents.
 * @param {app.Authentication} appAuthentication
 * @param {angular.Scope} $rootScope Scope.
 * @constructor
 * @ngInject
 * @struct
 */
app.Document = function(appAuthentication, $rootScope) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.rootScope_ = $rootScope;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @export
   */
  this.document = /** @type {appx.Document} */ ({
    'associations': {
      'waypoints': [],
      'waypoint_children': [],
      'routes': [],
      'all_routes': {'total': 0, 'routes': []},
      'users': [],
      'recent_outings': {'total': 0, 'outings': []},
      'images': []
    },
    'locales': [{'title': '', 'lang': ''}],
    'type': '',
    'document_id': 0,
    'quality': ''
  });

  /**
   * @type {{
   *  routes: Array<number>,
   *  waypoints: Array<number>,
   *  users: Array<number>,
   *  images: Array<number>
   * }}
   * @private
   */
  this.associationsIds_ = {
    'routes': [], 'waypoints': [], 'images': [], 'users': []
  };
};


/**
 * @param {appx.Document} doc
 * @export
 */
app.Document.prototype.setDocument = function(doc) {
  for (var attr in doc) {
    if (attr === 'associations') {
      this.setAssociations(doc.associations);
    } else {
      this.document[attr] = doc[attr];
    }
  }
};


/**
 * @param {appx.DocumentAssociations} associations
 * @export
 */
app.Document.prototype.setAssociations = function(associations) {
  for (var type in associations) {
    if (type in this.document.associations) {
      this.document.associations[type] = associations[type];
    }
  }
};


/**
 * @export
 * @param {string} type
 * @param {number} id
 * @returns {boolean}
 */
app.Document.prototype.hasAssociation = function(type, id) {
  if (!this.associationsIds_[type].length) {
    this.associationsIds_[type] = [];
    if (this.document.associations[type]) {
      for (var i = 0; i < this.document.associations[type].length; i++) {
        this.associationsIds_[type].push(this.document.associations[type][i]['document_id']);
      }
    }
  }
  return (this.associationsIds_[type].indexOf(id) > -1);
};


/**
 * @param {appx.SimpleSearchDocument} doc
 * @param {string=} doctype Optional doctype
 * @param {boolean=} setOutingTitle
 * @export
 */
app.Document.prototype.pushToAssociations = function(doc, doctype,
    setOutingTitle) {
  var associations = this.document.associations;
  doctype = doctype || app.utils.getDoctype(doc['type']);
  setOutingTitle = typeof setOutingTitle !== 'undefined' ?
    setOutingTitle : false;
  doc['new'] = true;
  associations[doctype].push(doc);

  // When creating an outing, the outing title defaults to the title
  // of the first associated route.
  if (setOutingTitle && doctype === 'routes' &&
      !this.document.locales[0]['title'] &&
      this.document.associations.routes.length === 1) {
    var title = 'title_prefix' in doc.locales[0] &&
      doc.locales[0]['title_prefix'] ?
      doc.locales[0]['title_prefix'] + ' : ' : '';
    title += doc.locales[0]['title'];
    this.document.locales[0]['title'] = title;
  }
};


/**
 * @param {number} id Id of document to unassociate
 * @param {string} type Type of document to unassociate
 * @param {goog.events.Event | jQuery.Event} [event]
 * @export
 */
app.Document.prototype.removeAssociation = function(id, type, event) {
  var associations = type === 'outings' ?
          this.document.associations.recent_outings.outings :
          this.document.associations[type];

  event.currentTarget.closest('.list-item').className += ' remove-item';
  // you need settimeout because if you splice the array immediatly, the animation
  // will have not enough time to complete and therefore will disappear instantly. Animation first, then remove from array.
  setTimeout(function() {
    for (var i = 0; i < associations.length; i++) {
      if (associations[i]['document_id'] === id) {
        associations.splice(i, 1);
        this.rootScope_.$apply();
        break;
      }
    }
  }.bind(this), 500); //remove animation duration
};


/**
 * - waypoints, routes and books are collaborative
 * - outings and books are personal and we have to check if the current user
 *   has editing rights
 * - images can be both and we have to check the image_type property
 * @param {string} type
 * @return boolean
 * @export
 */
app.Document.prototype.isCollaborative = function(type) {
  if (type === 'waypoints' || type === 'routes' || type === 'books') {
    return true;
  } else if (type === 'xreports') {
    // personal -> check if user == owner
    return false;
  } else if (type === 'outings' || type === 'articles') {
    // check if user == owner or participant of the outing/article
    return this.auth_.hasEditRights(this.document.associations['users'], null);
  } else if (type === 'images') {
    return this.document['image_type'] === 'collaborative';
  }
  return true;
};

app.module.service('appDocument', app.Document);
