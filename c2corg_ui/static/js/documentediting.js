goog.provide('app.DocumentEditingController');
goog.provide('app.documentEditingDirective');

goog.require('app');
goog.require('app.Alerts');
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
    controller: 'appDocumentEditingController',
    controllerAs: 'editCtrl',
    bindToController: true
  };
};


app.module.directive('appDocumentEditing', app.documentEditingDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {app.Authentication} appAuthentication
 * @param {app.Alerts} appAlerts
 * @param {string} apiUrl Base URL of the API.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 * @export
 */
app.DocumentEditingController = function($scope, $element, $attrs, $http,
    appAuthentication, appAlerts, apiUrl, authUrl) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.module_ = $attrs['appDocumentEditing'];
  goog.asserts.assert(goog.isDef(this.module_));

  /**
   * @type {string}
   * @private
   */
  this.modelName_ = $attrs['appDocumentEditingModel'];

  /**
   * @type {?number}
   * @private
   */
  this.id_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.lang_ = null;

  /**
   * @type {ol.format.GeoJSON}
   * @private
   */
  this.geojsonFormat_ = new ol.format.GeoJSON();

  /**
   * @type {boolean}
   * @private
   */
  this.isNewLang_ = false;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  // When creating a new document, the model is not created until
  // the form is touched. At least create an empty object.
  this.scope_[this.modelName_] = {};

  if ('appDocumentEditingId' in $attrs &&
      'appDocumentEditingLang' in $attrs) {
    this.id_ = $attrs['appDocumentEditingId'];
    this.lang_ = $attrs['appDocumentEditingLang'];

    if (this.auth_.isAuthenticated()) {
      // Get document attributes from the API to feed the model:
      this.http_.get(this.buildUrl_('read')).then(
          this.successRead_.bind(this),
          this.errorRead_.bind(this)
      );
    } else {
      // Redirect to the auth page
      var current_url = window.location.href;
      window.location.href = '{authUrl}?from={redirect}'
          .replace('{authUrl}', this.authUrl_)
          .replace('{redirect}', encodeURIComponent(current_url));
    }
  }

  this.scope_.$root.$on('mapFeatureChange', function(event, feature) {
    this.handleMapFeatureChange_(feature);
    this.scope_.$apply();
  }.bind(this));
};


/**
 * @const
 * @type {string}
 */
app.DocumentEditingController.FORM_PROJ = 'EPSG:4326';


/**
 * @const
 * @type {string}
 */
app.DocumentEditingController.DATA_PROJ = 'EPSG:3857';


/**
 * @param {string} type Type of URL.
 * @return {string} URL.
 * @private
 */
app.DocumentEditingController.prototype.buildUrl_ = function(type) {
  switch (type) {
    case 'read':
      return '{base}/{module}/{id}?l={lang}'
          .replace('{base}', this.apiUrl_)
          .replace('{module}', this.module_)
          .replace('{id}', String(this.id_))
          .replace('{lang}', this.lang_);
    case 'update':
      return '{base}/{module}/{id}'
          .replace('{base}', this.apiUrl_)
          .replace('{module}', this.module_)
          .replace('{id}', String(this.id_));
    default:
      return '{base}/{module}'
          .replace('{base}', this.apiUrl_)
          .replace('{module}', this.module_);
  }
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successRead_ = function(response) {
  var data = response['data'];
  var toCoordinates = (function(str) {
    // FIXME handle lines and polygons
    var point = /** @type {ol.geom.Point} */
        (this.geojsonFormat_.readGeometry(str));
    return this.getCoordinatesFromPoint_(point);
  }).bind(this);

  if ('geometry' in data && data['geometry']) {
    var geometry = data['geometry'];
    if ('geom' in geometry && geometry['geom']) {
      var coordinates = toCoordinates(geometry['geom']);
      data['lonlat'] = {
        'longitude': coordinates[0],
        'latitude': coordinates[1]
      };
      data['read_lonlat'] = angular.copy(data['lonlat']);
    }
  }

  if (!data['locales'].length) {
    // locales attributes are missing when creating a new lang version
    data['locales'].push({
      'lang': this.lang_
    });
    this.isNewLang_ = true;
  }

  this.scope_[this.modelName_] = data;
  this.scope_.$root.$emit('documentDataChange', data);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorRead_ = function(response) {
  this.alerts_.addError(response);
};


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentEditingController.prototype.submitForm = function(isValid) {
  if (!isValid) {
    this.alerts_.addError('Form is not valid');
    return;
  }

  if (!this.auth_.isAuthenticated()) {
    this.alerts_.addError('You have no permission to modify this document');
    return;
  }

  // push to API
  var data = angular.copy(this.scope_[this.modelName_]);
  if (!goog.isArray(data['locales'])) {
    // With ng-model="route.locales[0].description" route.locales is taken
    // as an object instead of an array.
    var locale = data['locales']['0'];
    data['locales'] = [locale];
  }

  // Convert point geometry data
  if ('lonlat' in data && data['lonlat']) {
    var lonlat = data['lonlat'];
    if ('longitude' in lonlat && 'latitude' in lonlat) {
      var point = new ol.geom.Point([lonlat['longitude'], lonlat['latitude']]);
      point.transform(app.DocumentEditingController.FORM_PROJ,
                      app.DocumentEditingController.DATA_PROJ);
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

  var config = {
    'headers': {'Content-Type': 'application/json'}
  };
  if (this.id_) {
    // updating an existing document
    if ('available_langs' in data) {
      delete data['available_langs'];
    }
    var message = '';
    if ('message' in data) {
      message = data['message'];
      delete data['message'];
    }
    data = {
      'message': message,
      'document': data
    };
    this.http_.put(this.buildUrl_('update'), data, config).then(
        this.successSave_.bind(this),
        this.errorSave_.bind(this)
    );
  } else {
    // creating a new document
    this.lang_ = data['locales'][0]['lang'];
    this.http_.post(this.buildUrl_('create'), data, config).then(
        this.successSave_.bind(this),
        this.errorSave_.bind(this)
    );
  }
  // TODO: show a loading message until doc saving is done
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successSave_ = function(response) {
  // redirects to the document view page
  goog.asserts.assert(this.lang_ !== null);
  var url = app.utils.buildDocumentUrl(
      this.module_, response['data']['document_id'], this.lang_);
  window.location.href = url;
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorSave_ = function(response) {
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
 * @param {string} view_url URL of view page.
 * @param {string} index_url URL of index page.
 * @export
 */
app.DocumentEditingController.prototype.cancel = function(view_url,
    index_url) {
  var url = !view_url || this.isNewLang_ ? index_url : view_url;
  window.location.href = url;
};


/**
 * Called for instance when lon/lat inputs are modified.
 * @export
 */
app.DocumentEditingController.prototype.updateMap = function() {
  var data = this.scope_[this.modelName_];
  if ('lonlat' in data && data['lonlat']) {
    var lonlat = data['lonlat'];
    if ('longitude' in lonlat && 'latitude' in lonlat) {
      var point = new ol.geom.Point([lonlat['longitude'], lonlat['latitude']]);
      point.transform(app.DocumentEditingController.FORM_PROJ,
                      app.DocumentEditingController.DATA_PROJ);
      // If creating a new document, the model has no geometry attribute yet:
      data['geometry'] = data['geometry'] || {};
      data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(point);
      this.scope_.$root.$emit('documentDataChange', data);
    }
  }
};


/**
 * @param {ol.Feature} feature
 * @private
 */
app.DocumentEditingController.prototype.handleMapFeatureChange_ = function(
    feature) {
  var geometry = feature.getGeometry();
  goog.asserts.assert(geometry);
  var data = this.scope_[this.modelName_];
  // If creating a new document, the model has no geometry attribute yet:
  data['geometry'] = data['geometry'] || {};
  data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(geometry);
  if (geometry instanceof ol.geom.Point) {
    var coords = this.getCoordinatesFromPoint_(geometry.clone());
    data['lonlat'] = {
      'longitude': coords[0],
      'latitude': coords[1]
    };
  }
};


/**
 * @param {ol.geom.Point} geometry
 * @return {ol.Coordinate}
 * @private
 */
app.DocumentEditingController.prototype.getCoordinatesFromPoint_ = function(
    geometry) {
  geometry.transform(app.DocumentEditingController.DATA_PROJ,
                     app.DocumentEditingController.FORM_PROJ);
  var coords = geometry.getCoordinates();
  return goog.array.map(coords, function(coord) {
    return Math.round(coord * 1000000) / 1000000;
  });
};


app.module.controller('appDocumentEditingController',
    app.DocumentEditingController);
