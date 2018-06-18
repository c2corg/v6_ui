/**
 * This service is used to access the document properties
 * within other controllers, for example to set the properties in one
 * controller and then read them in another.
 * Also to do all functions common to all documents.
 * @param {app.Authentication} AuthenticationService
 * @param {angular.Scope} $rootScope Scope.
 * @constructor
 * @ngInject
 * @struct
 */
export default class DocumentService {
  constructor(AuthenticationService, UtilsService, $rootScope) {
    'ngInject';

    this.utilsService_ = UtilsService;

    /**
     * @type {angular.Scope}
     * @private
     */
    this.rootScope_ = $rootScope;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.authService_ = AuthenticationService;

    /**
     * @export
     */
    this.document = /** @type {appx.Document} */ ({
      'associations': {
        'waypoints': [],
        'waypoint_children': [],
        'routes': [],
        'all_routes': {'total': 0, 'documents': []},
        'users': [],
        'recent_outings': {'total': 0, 'documents': []},
        'outings': [],
        'articles': [],
        'books': [],
        'xreports': [],
        'images': [],
        'areas': []
      },
      'locales': [{'title': '', 'lang': ''}],
      'type': '',
      'activities': [],
      'document_id': 0,
      'quality': ''
    });

    /**
     * @type {{
     *  routes: Array<number>,
     *  waypoints: Array<number>,
     *  users: Array<number>,
     *  images: Array<number>,
     *  areas: Array<number>,
     *  outings: Array<number>,
     *  books: Array<number>,
     *  xreports: Array<number>,
     *  articles: Array<number>
     * }}
     * @private
     */
    this.associationsIds_ = {
      'routes': [], 'waypoints': [], 'images': [], 'users': [], 'areas': [],
      'articles': [], 'outings': [], 'books': [], 'xreports': []
    };
  }


  /**
   * @param {appx.Document} doc
   * @export
   */
  setDocument(doc) {
    for (const attr in doc) {
      if (attr === 'associations') {
        this.setAssociations(doc.associations);
      } else {
        this.document[attr] = doc[attr];
      }
    }
  }


  /**
   * @param {appx.DocumentAssociations} associations
   * @export
   */
  setAssociations(associations) {
    for (const type in associations) {
      if (type in this.document.associations) {
        this.document.associations[type] = associations[type];
      }
    }
  }


  /**
   * @export
   * @param {string} type
   * @param {number} id
   * @returns {boolean}
   */
  hasAssociation(type, id) {
    if (!this.associationsIds_[type].length) {
      this.associationsIds_[type] = [];
      if (this.document.associations[type]) {
        for (let i = 0; i < this.document.associations[type].length; i++) {
          this.associationsIds_[type].push(this.document.associations[type][i]['document_id']);
        }
      }
    }
    return (this.associationsIds_[type].indexOf(id) > -1);
  }


  /**
   * @param {appx.SimpleSearchDocument} doc
   * @param {string=} doctype Optional doctype
   * @param {function(appx.Document, appx.SimpleSearchDocument, string=):appx.Document=} callback
   * @export
   */
  pushToAssociations(doc, doctype, callback) {
    doctype = doctype || this.utilsService_.getDoctype(doc['type']);
    doc['new'] = true;
    this.document.associations[doctype].push(doc);

    if (callback) {
      this.document = callback(this.document, doc, doctype);
    }
  }


  /**
   * @param {number} id Id of document to unassociate
   * @param {string} type Type of document to unassociate
   * @param {goog.events.Event | jQuery.Event} [event]
   * @param {boolean=} editing
   * @export
   */
  removeAssociation(id, type, event, editing) {
    const associations = this.document.associations[type];

    event.currentTarget.closest('.list-item').className += ' remove-item';
    // you need settimeout because if you splice the array immediatly, the animation
    // will have not enough time to complete and therefore will disappear instantly. Animation first, then remove from array.
    setTimeout(() => {
      for (let i = 0; i < associations.length; i++) {
        if (associations[i]['document_id'] === id) {
          associations.splice(i, 1);

          // when deleting a wp in route editing - make the first associated wp a main one
          if (editing && type === 'waypoints' && associations.length === 1) {
            this.document['main_waypoint_id'] = associations[0]['document_id'];
          }

          this.rootScope_.$apply();
          break;
        }
      }
    }, 500); //remove animation duration
  }


  /**
   * @param {string} type
   * @return boolean
   * @export
   */
  isCollaborative(type) {
    switch (type) {
      case 'waypoints':
      case 'routes':
      case 'books':
        return true;
      case 'outings':
      case 'users':
      case 'xreports':
        return false;
      case 'images':
        return this.document['image_type'] === 'collaborative';
      case 'articles':
        return this.document['article_type'] === 'collab';
      default:
        return false;
    }
  }
}
