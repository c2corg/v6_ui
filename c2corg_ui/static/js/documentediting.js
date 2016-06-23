goog.provide('app.DocumentEditingController');
goog.provide('app.documentEditingDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Document');
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
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} appDocument
 * @constructor
 * @ngInject
 * @export
 */
app.DocumentEditingController = function($scope, $element, $attrs,
    appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument) {

  /**
   * @type {app.Document}
   * @export
   */
  this.documentService = appDocument;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

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
   * @private
   */
  this.id_ = $attrs['appDocumentEditingId'];

  /**
   * @type {string}
   * @private
   */
  this.lang_ = $attrs['appDocumentEditingLang'];

  /**
   * @type {angular.Scope}
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
   * first next step would be 2 by default
   * @export
   */
  this.next_step = 2;

  /**
   * Current step is 1 by default
   * @export
   */
  this.current_step = 1;

  /**
   * Waypoint type initialised in the edit.html
   * @export
   */
  this.waypoint_type;

  /**
   * Previous step is 0 by default
   * @export
   */
  this.previous_step = 0;

  /**
   * Max possible steps for creation/edition
   * @export
   */
  this.max_steps;

 /**
  * @type {boolean}
  * @public
  */
  this.submit = false;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  this.scope[this.modelName] = this.scope['document'] = this.documentService.document;

  if (this.auth.isAuthenticated()) {
    if (this.id_ && this.lang_) {
     // Get document attributes from the API to feed the model:
      goog.asserts.assert(!goog.isNull(this.id_));
      goog.asserts.assert(!goog.isNull(this.lang_));
      this.api_.readDocument(this.module_, this.id_, this.lang_, true).then(
          this.successRead.bind(this)
      );
    }
  } else {
    // Redirect to the auth page
    var current_url = window.location.href;
    window.location.href = '{authUrl}?from={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(current_url));
    return;
  }

  this.scope.$root.$on('mapFeaturesChange', function(event, features) {
    this.handleMapFeaturesChange_(features);
  }.bind(this));
};


/**
 * @param {Object} response Response from the API server.
 * @public
 */
app.DocumentEditingController.prototype.successRead = function(response) {
  var data = response['data'];
  var toCoordinates = (function(str) {
    var point = /** @type {ol.geom.Point} */
        (this.geojsonFormat_.readGeometry(str));
    return this.getCoordinatesFromPoint_(point);
  }).bind(this);

  this.documentService.setAssociations(data['associations']);

  if ('geometry' in data && data['geometry']) {
    var geometry = data['geometry'];
    // don't add lonlat for line or polygon geometries
    // (point geometries have no 'geom_detail' attribute)
    if (!('geom_detail' in geometry) &&
        'geom' in geometry && geometry['geom']) {
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

  this.scope[this.modelName] = this.scope['document'] = this.documentService.document = data;
  this.scope.$root.$emit('documentDataChange', data);
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
    var locale = data['locales']['0'];
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

  this.submit = true;

  if (this.id_) {
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
    this.api_.updateDocument(this.module_, this.id_, data).then(function() {
      window.location.href = app.utils.buildDocumentUrl(
        this.module_, this.id_, this.lang_);
    }.bind(this)
    );
  } else {
    // creating a new document
    this.lang_ = data['locales'][0]['lang'];
    data = this.prepareData(data);
    this.api_.createDocument(this.module_, data).then(function(response) {
      this.id_ = response['data']['document_id'];
      window.location.href = app.utils.buildDocumentUrl(
        this.module_, this.id_, this.lang_);
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
app.DocumentEditingController.prototype.handleMapFeaturesChange_ = function(
    features) {
  // TODO handle multiple features?
  var feature = features[0];
  var geometry = feature.getGeometry();
  goog.asserts.assert(geometry);
  var isPoint = geometry instanceof ol.geom.Point;
  var data = this.scope[this.modelName];
  // If creating a new document, the model has no geometry attribute yet:
  data['geometry'] = data['geometry'] || {};
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
  this.hasGeomChanged_ = true;
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
 * Navigate through creation/editing steps
 * @param {number} step
 * @param {string} direction
 * @export
 */
app.DocumentEditingController.prototype.step = function(step, document, direction) {

  switch (step) {
    case 1:
      $('.editing').animate({left: '0'});
      this.animateBar_(step, direction);
      this.previous_step = 0;
      this.current_step = 1;
      this.next_step = 2;
      break;

    case 2:
      $('.editing').animate({left: '-115%'});
      this.animateBar_(step, direction);
      this.previous_step = 1;
      this.current_step = 2;
      this.next_step = 3;
      break;

    case 3:
      $('.editing').animate({left: '-229%'});
      this.animateBar_(step, direction);
      this.previous_step = 2;
      this.current_step = 3;
      this.next_step = 4;
      break;

    case 4:
      $('.editing').animate({left: '-343%'});
      this.animateBar_(step, direction);
      this.previous_step = 3;
      this.current_step = 4;
      this.next_step = 5;
      break;

    case 5:
      $('.editing').animate({left: '-457%'});
      this.animateBar_(step, direction);
      this.previous_step = 4;
      this.current_step = 5;
      this.next_step = 6;
      break;

    default:
      break;
  }
};


/**
 * Animate the progress bar
 * @param {number} step
 * @param {string} direction
 * @private
 */
app.DocumentEditingController.prototype.animateBar_ = function(step, direction) {
  var percent = 100 / this.max_steps;
  var green = '#7EFF1F'; // completed color
  var gray = '#B4B4B4'; // left color
  var willBe;
  var nextPosition;
  var stopBack;

  $('.nav-step-selected').removeClass('nav-step-selected');
  $('.nav-step-' + step).addClass('nav-step-selected');
  $('html, body').animate({scrollTop: 0}, 'slow');

  if (direction === 'forwards') {
    willBe = (percent * (step - 1)) - 10;
    nextPosition = (percent * step) - 10;
  } else {
    willBe = (percent * step) - 10;
    nextPosition = (percent * (step + 1)) - 10;
    stopBack = willBe;
  }

  // bar animation, timeout for a gradual filling
  var timeout = setInterval(function() {
    // if the direction is forwards, animate bar to the right
    if (direction === 'forwards') {
      // animate till the end (120%)
      if (step === this.max_steps) {
        if (willBe >= 120) {
          clearTimeout(timeout);
        } else {
          willBe++;
        }
        // animate to the next position ->
      } else {
        if (willBe >= nextPosition) {
          clearTimeout(timeout);
        } else {
          willBe++;
        }
      }
      // if the direction is backwards, animate bar to the left <-
    } else {
      if (willBe >= stopBack) {
        nextPosition--;
        willBe = nextPosition;
      } else {
        clearTimeout(timeout);
      }
    }

    $('.progress-bar-edit')
      .css({'background-image': '-webkit-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-o-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-moz-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-ms-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': 'linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'});
  }.bind(this), 10);
};


/**
 * Update steps, depending on the waypoint type.
 * @param {string} waypointType
 * @export
 */
app.DocumentEditingController.prototype.updateMaxSteps = function(waypointType) {
  this.max_steps = app.constants.STEPS[waypointType] || 3;
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
  var fields = app.constants.REQUIRED_FIELDS[type];
  // understandable structure by alertService
  var missing = {'data': {'errors': []}};
  var hasError;
  var field;
  for (var i = 0; i < fields.length; i++) {
    field = fields[i];
    hasError = false;

    if (field === 'title' || field === 'lang') {
      hasError = (!doc['locales'] || !doc['locales'][0][field]);
    } else if (field === 'activities') {
      hasError = (!doc['activities'] || doc['activities'].length === 0);
    } else if (field === 'routes') {
      hasError = (!doc['associations'] || doc['associations']['routes'].length === 0);
    } else if (field === 'latitude' || field === 'longitude') {
      hasError = (!doc['lonlat'] || (doc['lonlat'][field] === null || doc['lonlat'][field] === undefined));
    } else if (field === 'date_start') {
      hasError = (doc['date_start'] === null || doc['date_start']  === undefined);
    } else {
      hasError = (!doc[field] || doc[field] === null || doc[field] === undefined);
    }
    if (hasError) {
      if (showError) {
        missing['data']['errors'].push({
          'description': 'Missing field',
          'name': field
        });
      } else {
        return true;
      }
    }
  }
  if (missing['data']['errors'].length > 0) {
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
 * @param {Object} document (route, outing, waypoint)
 * @export
 */
app.DocumentEditingController.prototype.setOrientation = function(orientation, document, e) {
  app.utils.pushToArray(document, 'orientations', orientation, e);
};


app.module.controller('appDocumentEditingController', app.DocumentEditingController);
