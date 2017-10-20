goog.provide('app.DocumentEditingController');
goog.provide('app.PreviewModalController');
goog.provide('app.documentEditingDirective');
goog.provide('app.ConfirmSaveController');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Document');
goog.require('app.Lang');
goog.require('app.Url');
goog.require('app.utils');
goog.require('goog.asserts');
goog.require('ol.format.GeoJSON');
goog.require('ol.geom.Point');


/**
 * Provides the "appDocumentEditing" directive, which applies to the forms
 * used to create a new document (whatever its type) or to edit an existing
 * one. The fields and validations are set and performed in the form itself.
 *
 * @example
 * <form app-document-editing="waypoints" app-document-editing-model="waypoint"
 *   app-document-editing-id="42" app-document-editing-lang="fr"
 *   name="editForm" novalidate
 *   ng-submit="editCtrl.submitForm(editForm.$valid)">
 *
 * The main directive attribute contains the resource name (eg. "waypoints").
 * Additional attributes are used to specify the model name and, optionally,
 * the document id and lang.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.documentEditingDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: '@',
    name: 'appDocumentEditingControllerName',
    controllerAs: 'editCtrl',
    bindToController: true
  };
};


app.module.directive('appDocumentEditing', app.documentEditingDirective);


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {Object} $uibModal modal from angular bootstrap.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Lang} appLang Lang service.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} appDocument
 * @param {app.Url} appUrl URL service.
 * @param {!string} imageUrl URL to the image backend.
 * @constructor
 * @ngInject
 */
app.DocumentEditingController = function($scope, $element, $attrs, $http,
    $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
    appApi, authUrl, appDocument, appUrl, imageUrl) {

  /**
   * @type {app.Document}
   * @export
   */
  this.documentService = appDocument;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;

  /**
   * @type {app.Authentication}
   * @public
   */
  this.auth = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.module_ = $attrs['appDocumentEditing'];
  goog.asserts.assert(goog.isDef(this.module_));

  /**
   * @type {string}
   * @public
   */
  this.modelName = $attrs['appDocumentEditingModel'];

  /**
   * @type {number}
   * @public
   */
  this.id = $attrs['appDocumentEditingId'];

  /**
   * @type {string}
   * @private
   */
  this.lang_ = $attrs['appDocumentEditingLang'];

  /**
   * @type {!angular.Scope}
   * @export
   */
  this.scope = $scope;

  /**
   * @type {ol.format.GeoJSON}
   * @private
   */
  this.geojsonFormat_ = new ol.format.GeoJSON();

  /**
   * @type {boolean}
   * @private
   */
  this.hasGeomChanged_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.isNewLang_ = false;

  /**
   * @type {app.Alerts}
   * @public
   */
  this.alerts = appAlerts;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {Object} angular bootstrap modal
   * @public
   */
  this.modal = $uibModal;

  /**
   * @type {angular.$compile}
   * @public
   */
  this.compile = $compile;

  this.scope[this.modelName] = this.documentService.document;

  if (this.auth.isAuthenticated()) {
    if (this.id && this.lang_) {
     // Get document attributes from the API to feed the model:
      goog.asserts.assert(!goog.isNull(this.id));
      goog.asserts.assert(!goog.isNull(this.lang_));
      this.api_.readDocument(this.module_, this.id, this.lang_, true).then(
          this.successRead.bind(this)
      );
    } else if (!this.id) {
      // new doc lang = user interface lang
      this.scope[this.modelName]['locales'][0]['lang'] = appLang.getLang();
    }
  } else {
    // Redirect to the auth page
    app.utils.redirectToLogin(this.authUrl_);
    return;
  }

  this.scope.$root.$on('mapFeaturesChange', function(event, features) {
    this.handleMapFeaturesChange_(features);
  }.bind(this));

  this.scope.$root.$on('mapFeaturesReset', function(event, initialGeometry) {
    this.handleMapFeaturesReset_(initialGeometry);
  }.bind(this));
};


/**
 * @param {appx.Document} data
 * @return {appx.Document}
 * @public
 */
app.DocumentEditingController.prototype.filterData = function(data) {
  // To be overridden in child classes
  return data;
};


/**
 * @param {Object} response Response from the API server.
 * @public
 */
app.DocumentEditingController.prototype.successRead = function(response) {
  var data = response['data'];
  this.documentService.setAssociations(data['associations']);

  data = this.filterData(data);
  this.updateGeometry_(data);

  if (!data['locales'].length) {
    // locales attributes are missing when creating a new lang version
    data['locales'].push({'lang': this.lang_});
    this.isNewLang_ = true;
  }

  this.scope[this.modelName] = this.scope['document'] = this.documentService.document = data;
  this.scope.$root.$emit('documentDataChange', data);
};


/**
 * @param {string} str
 * @private
 */
app.DocumentEditingController.prototype.toCoordinates_ = function(str) {
  var point = /** @type {ol.geom.Point} */
      (this.geojsonFormat_.readGeometry(str));
  return this.getCoordinatesFromPoint_(point);
};


/**
 * @param {Object} data
 * @private
 */
app.DocumentEditingController.prototype.updateGeometry_ = function(data) {
  if ('geometry' in data && data['geometry']) {
    var geometry = data['geometry'];
    // don't add lonlat for line or polygon geometries
    // (point geometries have no 'geom_detail' attribute)
    if (this.isPointType_() && !('geom_detail' in geometry && geometry['geom_detail']) &&
        'geom' in geometry && geometry['geom']) {
      var coordinates = this.toCoordinates_(geometry['geom']);
      data['lonlat'] = {
        'longitude': coordinates[0],
        'latitude': coordinates[1]
      };
      data['read_lonlat'] = angular.copy(data['lonlat']);
    }
  }
};


/**
 * @private
 */
app.DocumentEditingController.prototype.isPointType_ = function() {
  var nonPointModels = ['outing', 'route', 'area'];
  return $.inArray(this.modelName, nonPointModels) === -1;
};


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentEditingController.prototype.submitForm = function(isValid) {
  if (!isValid) {
    this.alerts.addError('Form is not valid');
    return;
  }

  if (!this.auth.isAuthenticated()) {
    this.alerts.addError('You must log in to edit this document.');
    return;
  }

  // push to API
  var data = angular.copy(this.scope[this.modelName]);
  if (!goog.isArray(data['locales'])) {
    // With ng-model="route.locales[0].description" route.locales is taken
    // as an object instead of an array.
    var locale = data['locales'][0];
    data['locales'] = [locale];
  }

  // Convert point geometry data
  if ('lonlat' in data && data['lonlat']) {
    var lonlat = data['lonlat'];
    if ('longitude' in lonlat && 'latitude' in lonlat) {
      var point = new ol.geom.Point([lonlat['longitude'], lonlat['latitude']]);
      point.transform(app.constants.documentEditing.FORM_PROJ,
                      app.constants.documentEditing.DATA_PROJ);
      // If creating a new document, the model has no geometry attribute yet:
      data['geometry'] = data['geometry'] || {};

      var changed = true;
      if (data['read_lonlat']) {
        changed = data['read_lonlat']['longitude'] !== lonlat['longitude'] ||
            data['read_lonlat']['latitude'] !== lonlat['latitude'];
      }
      if (changed) {
        data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(point);
      } else {
        delete data['geometry']; // skip update of the geometry
      }
    }
    delete data['lonlat'];
    delete data['read_lonlat'];
  }

  if (this.id) {
    // updating an existing document
    if (!this.hasGeomChanged_) {
      // no need to push the unchanged geometry back
      delete data['geometry'];
    }
    if ('available_langs' in data) {
      delete data['available_langs'];
    }
    var message = '';
    if ('message' in data) {
      message = data['message'];
      delete data['message'];
    }
    data = this.prepareData(data);
    data = {
      'message': message,
      'document': data
    };
    this.api_.updateDocument(this.module_, this.id, data).then(function() {
      window.location.href = this.url_.buildDocumentUrl(
        this.module_, this.id, this.documentService.document['locales'][0]);
    }.bind(this)
    );
  } else {
    // creating a new document
    this.lang_ = data['locales'][0]['lang'];
    data = this.prepareData(data);
    this.api_.createDocument(this.module_, data).then(function(response) {
      this.id = response['data']['document_id'];
      window.location.href = this.url_.buildDocumentUrl(
        this.module_, this.id, data['locales'][0]);
    }.bind(this));
  }
};


/**
 * @param {appx.Document} data Document attributes.
 * @return {appx.Document}
 * @public
 */
app.DocumentEditingController.prototype.prepareData = function(data) {
  // Do nothing special in the standard editing controller.
  // Might be overridden in inheriting controllers.
  return data;
};


/**
 * @param {string} view_url URL of view page.
 * @param {string} index_url URL of index page.
 * @export
 */
app.DocumentEditingController.prototype.cancel = function(view_url, index_url) {
  var url = !view_url || this.isNewLang_ ? index_url : view_url;
  window.location.href = url;
};


/**
 * Called for instance when lon/lat inputs are modified.
 * @export
 */
app.DocumentEditingController.prototype.updateMap = function() {
  var data = this.scope[this.modelName];
  if ('lonlat' in data && data['lonlat']) {
    var lonlat = data['lonlat'];
    if ('longitude' in lonlat && 'latitude' in lonlat) {
      var point = new ol.geom.Point([lonlat['longitude'], lonlat['latitude']]);
      point.transform(app.constants.documentEditing.FORM_PROJ, app.constants.documentEditing.DATA_PROJ);
      // If creating a new document, the model has no geometry attribute yet:
      data['geometry'] = data['geometry'] || {};
      data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(point);
      this.hasGeomChanged_ = true;
      this.scope.$root.$emit('documentDataChange', data);
    }
  }
};


/**
 * @param {Array.<ol.Feature>} features
 * @private
 */
app.DocumentEditingController.prototype.handleMapFeaturesChange_ = function(features) {
  var data = this.scope[this.modelName];

  // If creating a new document, the model has no geometry attribute yet:
  data['geometry'] = data['geometry'] || {};

  if (features.length == 0) {
    data['geometry']['geom'] = null;
    data['geometry']['geom_detail'] = null;
    if (this.isPointType_()) {
      data['lonlat'] = null;
    }
  } else {
    var feature = features[0];
    var geometry = feature.getGeometry();
    goog.asserts.assert(geometry);
    var isPoint = geometry instanceof ol.geom.Point;
    if (isPoint) {
      data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(geometry);
      var coords = this.getCoordinatesFromPoint_(
          /** @type {ol.geom.Point} */ (geometry.clone()));
      data['lonlat'] = {
        'longitude': coords[0],
        'latitude': coords[1]
      };
      this.scope.$apply();
    } else {
      var center;
      // For lines, use the middle point as point geometry:
      if (geometry instanceof ol.geom.LineString) {
        center = geometry.getCoordinateAt(0.5);
      } else if (geometry instanceof ol.geom.MultiLineString) {
        center = geometry.getLineString(0).getCoordinateAt(0.5);
      } else {
        center = ol.extent.getCenter(geometry.getExtent());
      }
      var centerPoint = new ol.geom.Point(center);
      data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(centerPoint);
      data['geometry']['geom_detail'] = this.geojsonFormat_.writeGeometry(geometry);
    }
  }

  this.hasGeomChanged_ = true;
};


/**
 * @param {Object} initialGeometry
 * @private
 */
app.DocumentEditingController.prototype.handleMapFeaturesReset_ = function(initialGeometry) {
  var data = this.scope[this.modelName];
  data['geometry'] = initialGeometry;
  this.hasGeomChanged_ = false;
  this.updateGeometry_(data);
  this.scope.$root.$emit('documentDataChange', data);
};


/**
 * @param {ol.geom.Point} geometry
 * @return {ol.Coordinate}
 * @private
 */
app.DocumentEditingController.prototype.getCoordinatesFromPoint_ = function(
    geometry) {
  geometry.transform(app.constants.documentEditing.DATA_PROJ,
                     app.constants.documentEditing.FORM_PROJ);
  var coords = geometry.getCoordinates();
  return goog.array.map(coords, function(coord) {
    return Math.round(coord * 1000000) / 1000000;
  });
};

/**
 * @param {appx.Document} doc
 * @param {boolean} showError Whether alerts must be shown for detected errors.
 * Check what properties are missing and tell the user.
 * @export
 * @return {boolean | undefined}
 */
app.DocumentEditingController.prototype.hasMissingProps = function(doc, showError) {
  var type = doc.type ? app.utils.getDoctype(doc.type) : this.module_;
  var requiredFields = app.constants.REQUIRED_FIELDS[type] || null;
  if (!requiredFields) {
    return false;
  }
  // understandable structure by alertService
  var missing = {'data': {'errors': []}};
  var hasError;
  var field;
  for (var i = 0; i < requiredFields.length; i++) {
    field = requiredFields[i];
    hasError = false;
    if (field === 'title' || field === 'lang') {
      hasError = (!doc['locales'] || !doc['locales'][0][field]);
    } else if (field === 'activities') {
      hasError = (!doc['activities'] || doc['activities'].length === 0);
    } else if (field === 'routes' || field === 'waypoints') {
      hasError = (!doc['associations'] || doc['associations'][field].length === 0);
    } else if (field === 'latitude' || field === 'longitude') {
      hasError = (!doc['lonlat'] || (doc['lonlat'][field] === null || doc['lonlat'][field] === undefined));
    } else if (field === 'date_start') {
      hasError = (doc['date_start'] === null || doc['date_start']  === undefined);
    } else if (field === 'elevation' && doc['waypoint_type'] === 'climbing_indoor') {
      // waypoint climbing indoor is the only one that does not require 'elevation'
      continue;
    } else if (field === 'url') {
      // weather station and webcam require URL
      if (doc['waypoint_type'] === 'weather_station' || doc['waypoint_type'] === 'webcam') {
        hasError = !doc['url'];
      } else {
        continue;
      }
    } else {
      hasError = (!doc[field] || doc[field] === null || doc[field] === undefined);
    }

    if (hasError) {
      if (showError) {
        if (field === 'routes' || field === 'waypoints') {
          field = 'no associated ' + field;
        }
        missing['data']['errors'].push({
          'description': 'Missing field',
          'name': field
        });
      } else {
        return true;
      }
    }
  }
  if (missing['data']['errors'].length) {
    this.alerts.addError(missing);
  }
  return hasError;
};


/**
 *
 * @param {Object} object
 * @param {string} property
 * @param {string} value
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.DocumentEditingController.prototype.pushToArray = function(object, property, value, event) {
  app.utils.pushToArray(object, property, value, event);
};


/**
 * Set the orientation of a document. Can have multiple orientations
 * @param {string} orientation
 * @param {appx.Document} document
 * @param {goog.events.Event | jQuery.Event} e
 * @export
 */
app.DocumentEditingController.prototype.toggleOrientation = function(orientation, document, e) {
  app.utils.pushToArray(document, 'orientations', orientation, e);
};


/**
 * @export
 */
app.DocumentEditingController.prototype.preview = function() {
  var config = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json'
    }
  };
  var url = '/' + this.module_ + '/preview';
  var data = angular.copy(this.scope[this.modelName]);
  data = {
    'document': this.prepareData(data)
  };
  this.http_.post(url, data, config).
    catch(function(response) {
      this.alerts.addError('A server error prevented creating the preview');
    }.bind(this)).
    then(function(response) {
      var template = angular.element('#preview-container').clone();
      template.find('.preview-container-content').append(response['data']);

      this.modal.open({
        animation: true,
        template: this.compile(template)(this.scope),
        controller: 'appPreviewModalController',
        controllerAs: 'previewModalCtrl',
        size: 'xl'
      });
    }.bind(this));
};


/**
 * @export
 */
app.DocumentEditingController.prototype.confirmSave = function(isValid) {
  if (!isValid) {
    this.alerts.addError('Form is not valid');
    return;
  }
  var template = angular.element('#save-confirmation-modal').clone();
  var modalInstance = this.modal.open({
    animation: true,
    template: this.compile(template)(this.scope),
    controller: 'appConfirmSaveModalController as saveCtrl'
  });

  modalInstance.result.then(function(res) {
    if (res) {
      this.scope[this.modelName]['message'] = res.message;
      this.scope[this.modelName]['quality'] = res.quality;
      this.submitForm(isValid);
    }
  }.bind(this));
};


/**
 * @param {string} selector
 * @param {string} sizem
 * @export
 */
app.DocumentEditingController.prototype.openModal = function(selector, sizem) {
  var template = $(selector).clone();
  this.modal.open({
    animation: true,
    size: sizem || 'lg',
    template: this.compile(template)(this.scope)
  });
};

app.module.controller('appDocumentEditingController', app.DocumentEditingController);


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 */
app.ConfirmSaveController = function($uibModalInstance, appDocument, appLang) {

  /**
   * @export
   * @type {app.Lang}
   */
  this.langService = appLang;

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;

  /**
   * @type {string}
   * @export
   */
  this.message = appDocument.document.message;

  /**
   * @type {string}
   * @export
   */
  this.quality = appDocument.document.quality || 'draft';

};


/**
 * @export
 */
app.ConfirmSaveController.prototype.close = function(action) {
  this.modalInstance_.close(action);
};


app.module.controller('appConfirmSaveModalController', app.ConfirmSaveController);


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.PreviewModalController}
 */
app.PreviewModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
app.PreviewModalController.prototype.close = function() {
  this.modalInstance_.close();
};


app.module.controller('appPreviewModalController', app.PreviewModalController);
