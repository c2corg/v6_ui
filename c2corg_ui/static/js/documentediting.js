goog.provide('app.DocumentEditingController');
goog.provide('app.documentEditingDirective');

goog.require('app');
goog.require('ol.format.GeoJSON');
goog.require('ol.geom.Point');


/**
 * Provides the "appDocumentEditing" directive, which applies to the forms
 * used to create a new document (whatever its type) or to edit an existing
 * one. The fields and validations are set and performed in the form itself.
 *
 * @example
 * <form app-document-editing="waypoints" app-document-editing-model="waypoint"
 *   app-document-editing-id="42" app-document-editing-culture="fr"
 *   name="editForm" novalidate
 *   ng-submit="editCtrl.submitForm(editForm.$valid)">
 *
 * The main directive attribute contains the resource name (eg. "waypoints").
 * Additional attributes are used to specify the model name and, optionally,
 * the document id and culture.
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
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @ngInject
 * @export
 */
app.DocumentEditingController = function($scope, $element, $attrs, $http,
    apiUrl) {

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
  this.culture_ = null;

  if ('appDocumentEditingId' in $attrs &&
      'appDocumentEditingCulture' in $attrs) {
    this.id_ = $attrs['appDocumentEditingId'];
    this.culture_ = $attrs['appDocumentEditingCulture'];
    // Get document attributes from the API to feed the model:
    this.http_.get(this.buildUrl_('read')).then(
        goog.bind(this.successRead_, this),
        goog.bind(this.errorRead_, this)
    );
  }
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
      return '{base}/{module}/{id}?l={culture}'
          .replace('{base}', this.apiUrl_)
          .replace('{module}', this.module_)
          .replace('{id}', String(this.id_))
          .replace('{culture}', this.culture_);
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
  if ('geometry' in data && data['geometry']) {
    var geometry = data['geometry'];
    if ('geom' in geometry && geometry['geom']) {
      var geojson = new ol.format.GeoJSON();
      // FIXME handle lines and polygons
      var point = /** @type {ol.geom.Point} */
          (geojson.readGeometry(geometry['geom']));
      geometry['geom'] = point.clone();
      point.transform(app.DocumentEditingController.DATA_PROJ,
                      app.DocumentEditingController.FORM_PROJ);
      var coordinates = point.getCoordinates();
      // FIXME: will rounding the coordinates cause a new version
      // of the geometry in the API?
      coordinates = goog.array.map(coordinates, function(coord) {
        return Math.round(coord * 1000000) / 1000000;
      });
      data['lonlat'] = {
        'longitude': coordinates[0],
        'latitude': coordinates[1]
      };
    }
  }
  this.scope_[this.modelName_] = data;
  this.scope_.$root.$emit('documentDataChange', data);
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorRead_ = function(response) {
  // TODO: use a common messaging tool to display the error
  alert('Failed loading the document: ' +
      response.status + ' ' + response.statusText);
};


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentEditingController.prototype.submitForm = function(isValid) {
  if (!isValid) {
    // TODO: use a common messaging tool to display the error
    alert('Form is not valid');
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
      var geojson = new ol.format.GeoJSON();
      data['geometry']['geom'] = geojson.writeGeometry(point);
    }
    delete data['lonlat'];
  }

  var config = {
    'headers': { 'Content-Type': 'application/json' }
  };
  if (this.id_) {
    // updating an existing document
    if ('available_cultures' in data) {
      delete data['available_cultures'];
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
        goog.bind(this.successSave_, this),
        goog.bind(this.errorSave_, this)
    );
  } else {
    // creating a new document
    this.culture_ = data['locales'][0]['culture'];
    this.http_.post(this.buildUrl_('create'), data, config).then(
        goog.bind(this.successSave_, this),
        goog.bind(this.errorSave_, this)
    );
  }
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successSave_ = function(response) {
  // redirects to the document view page
  var url = '/{module}/{id}/{culture}'
      .replace('{module}', this.module_)
      .replace('{id}', response['data']['document_id'])
      .replace('{culture}', this.culture_);
  window.location.href = url;
  // FIXME: use $window.location.href instead?
  // TODO: add a loading message
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorSave_ = function(response) {
  // TODO
  console.log('error save');
  console.log(response);
};


app.module.controller('appDocumentEditingController',
    app.DocumentEditingController);
