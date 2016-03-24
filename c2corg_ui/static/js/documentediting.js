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
 * @param {app.Authentication} appAuthentication
 * @param {app.Alerts} appAlerts
 * @param {app.Api} appApi Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @ngInject
 * @export
 */
app.DocumentEditingController = function($scope, $element, $attrs,
    appAuthentication, appAlerts, appApi, authUrl) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

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

  /**
   * first next step would be 2 by default
   * @export
   */
  this.next_step = 2;

  /**
   * Current step is 1by default
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
   * Waypoint init
   * @private
   */
  this.scope_.waypoint = {};

  /**
   * @export
   */
  this.differentDates;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  // When creating a new document, the model is not created until
  // the form is touched. At least create an empty object.
  this.scope_[this.modelName_] = {};
  if (this.auth_.isAuthenticated()) {

    if (this.id_ && this.lang_) {
     // Get document attributes from the API to feed the model:
      goog.asserts.assert(!goog.isNull(this.id_));
      goog.asserts.assert(!goog.isNull(this.lang_));
      this.api_.readDocument(this.module_, this.id_, this.lang_).then(
          this.successRead_.bind(this)
      );
    } else if (this.modelName_ === 'outing') {
      this.formatOuting_(this.scope_[this.modelName_]);
    }
  } else {
    // Redirect to the auth page
    var current_url = window.location.href;
    window.location.href = '{authUrl}?from={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(current_url));
    return;
  }

  this.scope_.$root.$on('mapFeatureChange', function(event, feature) {
    this.handleMapFeatureChange_(feature);
    this.scope_.$apply();
  }.bind(this));
};


/**
 * @param {Object} response Response from the API server.
 * @private
 * @suppress {checkTypes}
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

  if (this.modelName_ === 'outing') {
    this.scope_['outing'] = this.formatOuting_(this.scope_['outing']);
    this.differentDates = app.utils.areDifferentDates(this.scope_['outing']['date_start'], this.scope_['outing']['date_end']);
  }

  this.scope_.$root.$emit('documentDataChange', data);
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
    this.api_.updateDocument(this.module_, this.id_, data).then(function() {
      window.location.href = app.utils.buildDocumentUrl(
        this.module_, this.id_, this.lang_);
    }.bind(this)
    );
  } else {
    // creating a new document
    this.lang_ = data['locales'][0]['lang'];
    this.api_.createDocument(this.module_, data).then(function(response) {
      this.id_ = response['data']['document_id'];
      window.location.href = app.utils.buildDocumentUrl(
        this.module_, this.id_, this.lang_);
    }.bind(this));
  }
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
      point.transform(app.constants.documentEditing.FORM_PROJ, app.constants.documentEditing.DATA_PROJ);
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
  geometry.transform(app.constants.documentEditing.DATA_PROJ, app.constants.documentEditing.FORM_PROJ);
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
}


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

  if (app.constants.STEPS[waypointType]) {
    this.max_steps = app.constants.STEPS[waypointType];
  } else {
    this.max_steps = 3;
  }
}

/**
 * @param {Object} outing
 * @private
 */

app.DocumentEditingController.prototype.formatOuting_ = function(outing) {
  // creating a new outing -> init locales
  if (!outing['locales']) {
    outing['locales'] = [{}];
  }

  outing['date_start'] = app.utils.formatDate(outing['date_start']);
  outing['date_end'] = app.utils.formatDate(outing['date_end']);

  // conditions_levels -> to JSON and snow -> INT
  if (outing['locales'][0]['conditions_levels']) {
    outing['locales'][0]['conditions_levels'] = JSON.parse(outing['locales'][0]['conditions_levels']);
    for (var i = 0; i < outing['locales'][0]['conditions_levels'].length; i++) {
      var cond = outing['locales'][0]['conditions_levels'][i];
      cond['level_snow_height_soft'] = parseInt(cond['level_snow_height_soft'], 10);
      cond['level_snow_height_total'] = parseInt(cond['level_snow_height_total'], 10);
    }
  } else {
    // init empty conditions_levels for ng-repeat
    outing['locales'][0]['conditions_levels'] = [{'level_snow_height_soft': '', 'level_snow_height_total': '', 'level_comment': '', 'level_place': ''}];
  }

  return outing;
}


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
}


/**
 * Set the orientation of a document. Can have multiple orientations
 * @param {string} orientation
 * @param {Object} document (route, outing, waypoint)
 * @export
 */

app.DocumentEditingController.prototype.setOrientation = function(orientation, document, e) {
  app.utils.pushToArray(document, 'orientation', orientation, e);
}


app.module.controller('appDocumentEditingController',
    app.DocumentEditingController);
