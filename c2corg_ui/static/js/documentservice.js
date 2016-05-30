goog.provide('app.Document');

goog.require('app');


/**
 * This services is used to acces the document properties
 * within other controllers, for example to set the properties in one
 * controller and then read them in another.
 * Also to do all functions common to all documents.
 * @param {app.Authentication} appAuthentication
 * @constructor
 * @ngInject
 * @struct
 */
app.Document = function(appAuthentication) {

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
      'routes': [],
      'waypoints': [],
      'users': [],
      'recent_outings': {'total': 0, 'outings': []},
      'images': [],
      'waypoints_children': [],
      'waypoints_parents': [],
      'all_routes': {'total': 0, 'routes': []}
    },
    'locales': [{'title': ''}],
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
 * @export
 */
app.Document.prototype.pushToAssociations = function(doc) {
  var routesLength =  this.document.associations['routes'].length;
  var associations = this.document.associations;
  var doctype = app.utils.getDoctype(doc['type']);

  if (doctype === 'routes') {
    // if there are no routes = new document => set title to the title of the first associated route
    if (!routesLength) {
      this.document['locales'][0]['title'] = doc['locales'][0]['title'];
    }
  }
  associations[doctype].push(doc);
  return;
};


/**
 * @param {number} id
 * @param {string} type
 * @export
 */
app.Document.prototype.removeAssociation = function(id, type) {
  var associations = this.document.associations;
  for (var i = 0; i < associations[type].length; i++) {
    if (associations[type][i]['document_id'] === id) {
      associations[type].splice(i, 1);
      return;
    }
  }
};


/**
 * - waypoints, routes and books are not protected => collaborative
 * - outings and books are personal and we have to check if the current user is the owner
 * - images can be both and we have to check the image_type property
 * @param {string} type
 * @export
 * @return boolean
 */
app.Document.prototype.isCollaborative = function(type) {
  if (type === 'waypoints' || type === 'routes' || type === 'books') {
    return true;
  } else if (type === 'incident_reports') {
    // personal -> check if user == owner
    return false;
  } else if (type === 'outings' || type === 'articles') {
    // check if user == owner or participant of the outing/article
    return this.auth_.hasEditRights(this.document.associations['users']);
  } else if (type === 'images') {
    return this.document['image_type'] === 'collaborative';
  } else {
    return true;
  }
};

app.module.service('appDocument', app.Document);
