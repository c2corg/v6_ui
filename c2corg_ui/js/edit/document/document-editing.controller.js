import angular from 'angular';
import googAsserts from 'goog/asserts.js';
import olFormatGeoJSON from 'ol/format/geojson';
import olGeomLineString from 'ol/geom/linestring';
import olGeomMultiLineString from 'ol/geom/multilinestring';
import olGeomPoint from 'ol/geom/point';
import olExtent from 'ol/extent';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {Object} $uibModal modal from angular bootstrap.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Lang} LangService Lang service.
 * @param {app.Authentication} AuthenticationService
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {app.Api} ApiService Api service.
 * @param {string} authUrl Base URL of the authentication page.
 * @param {app.Document} DocumentService
 * @param {app.Url} appUrl URL service.
 * @constructor
 * @ngInject
 */
export default class DocumentEditingController {
  constructor($scope, $attrs, $http, $uibModal, $compile, LangService, AuthenticationService, appAlerts, ApiService,
    authUrl, DocumentService, UrlService, documentEditing, REQUIRED_FIELDS, UtilsService) {
    'ngInject';

    this.documentEditing = documentEditing;

    this.REQUIRED_FIELDS = REQUIRED_FIELDS;

    this.utilsService = UtilsService;

    /**
     * @type {app.Document}
     * @export
     */
    this.documentService = DocumentService;

    /**
     * @type {string}
     * @private
     */
    this.authurlService = authUrl;

    /**
     * @type {app.Authentication}
     * @public
     */
    this.auth = AuthenticationService;

    /**
     * @type {string}
     * @private
     */
    this.module_ = $attrs['c2cDocumentEditing'];
    googAsserts.assert(goog.isDef(this.module_));

    /**
     * @type {string}
     * @public
     */
    this.modelName = $attrs['c2cDocumentEditingModel'];

    /**
     * @type {number}
     * @public
     */
    this.id = $attrs['c2cDocumentEditingId'];

    /**
     * @type {string}
     * @private
     */
    this.lang_ = $attrs['c2cDocumentEditingLang'];

    /**
     * @type {!angular.Scope}
     * @export
     */
    this.scope = $scope;

    /**
     * @type {ol.format.GeoJSON}
     * @private
     */
    this.geojsonFormat_ = new olFormatGeoJSON();

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
    this.apiService_ = ApiService;

    /**
     * @type {app.Url}
     * @private
     */
    this.urlService = UrlService;

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
        googAsserts.assert(!goog.isNull(this.id));
        googAsserts.assert(!goog.isNull(this.lang_));
        this.apiService_.readDocument(this.module_, this.id, this.lang_, true).then(
          this.successRead.bind(this)
        );
      } else if (!this.id) {
        // new doc lang = user interface lang
        this.scope[this.modelName]['locales'][0]['lang'] = LangService.getLang();
      }
    } else {
      // Redirect to the auth page
      this.utilsService.redirectToLogin(this.authurlService);
      return;
    }

    this.scope.$root.$on('mapFeaturesChange', (event, features) => {
      this.handleMapFeaturesChange_(features);
    });

    this.scope.$root.$on('mapFeaturesReset', (event, initialGeometry) => {
      this.handleMapFeaturesReset_(initialGeometry);
    });
  }

  /**
   * @param {appx.Document} data
   * @return {appx.Document}
   * @public
   */
  filterData(data) {
    // To be overridden in child classes
    return data;
  }


  /**
   * @param {Object} response Response from the API server.
   * @public
   */
  successRead(response) {
    let data = response['data'];
    this.documentService.setAssociations(data['associations']);

    data = this.filterData(data);
    this.updateGeometry_(data);

    if (!data['locales'].length) {
      // locales attributes are missing when creating a new lang version
      data['locales'].push({'lang': this.lang_});
      this.isNewLang_ = true;
    }

    this.scope[this.modelName] = data;
    this.scope['document'] = data;
    this.documentService.document = data;
    this.scope.$root.$emit('documentDataChange', data);
  }


  /**
   * @param {string} str
   * @private
   */
  toCoordinates_(str) {
    const point = /** @type {ol.geom.Point} */
        (this.geojsonFormat_.readGeometry(str));
    return this.getCoordinatesFromPoint_(point);
  }


  /**
   * @param {Object} data
   * @private
   */
  updateGeometry_(data) {
    if ('geometry' in data && data['geometry']) {
      const geometry = data['geometry'];
      // don't add lonlat for line or polygon geometries
      // (point geometries have no 'geom_detail' attribute)
      if (this.isPointType_() && !('geom_detail' in geometry && geometry['geom_detail']) &&
          'geom' in geometry && geometry['geom']) {
        const coordinates = this.toCoordinates_(geometry['geom']);
        data['lonlat'] = {
          'longitude': coordinates[0],
          'latitude': coordinates[1]
        };
        data['read_lonlat'] = angular.copy(data['lonlat']);
      }
    }
  }


  /**
   * @private
   */
  isPointType_() {
    const nonPointModels = ['outing', 'route', 'area'];
    return $.inArray(this.modelName, nonPointModels) === -1;
  }


  /**
   * @param {boolean} isValid True if form is valid.
   * @export
   */
  submitForm(isValid) {
    if (!isValid) {
      this.alerts.addError('Form is not valid');
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.alerts.addError('You must log in to edit this document.');
      return;
    }

    // push to API
    let data = angular.copy(this.scope[this.modelName]);
    if (!Array.isArray(data['locales'])) {
      // With ng-model="route.locales[0].description" route.locales is taken
      // as an object instead of an array.
      const locale = data['locales'][0];
      data['locales'] = [locale];
    }

    // Convert point geometry data
    if ('lonlat' in data && data['lonlat']) {
      const lonlat = data['lonlat'];
      if ('longitude' in lonlat && 'latitude' in lonlat) {
        const point = new olGeomPoint([lonlat['longitude'], lonlat['latitude']]);
        point.transform(
          this.documentEditing.FORM_PROJ,
          this.documentEditing.DATA_PROJ
        );
        // If creating a new document, the model has no geometry attribute yet:
        data['geometry'] = data['geometry'] || {};

        let changed = true;
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
      let message = '';
      if ('message' in data) {
        message = data['message'];
        delete data['message'];
      }
      data = this.prepareData(data);
      data = {
        'message': message,
        'document': data
      };
      this.apiService_.updateDocument(this.module_, this.id, data).then(() => {
        window.location.href = this.urlService.buildDocumentUrl(
          this.module_, this.id, this.documentService.document['locales'][0]);
      }
      );
    } else {
      // creating a new document
      this.lang_ = data['locales'][0]['lang'];
      data = this.prepareData(data);
      this.apiService_.createDocument(this.module_, data).then((response) => {
        this.id = response['data']['document_id'];
        window.location.href = this.urlService.buildDocumentUrl(
          this.module_, this.id, data['locales'][0]);
      });
    }
  }


  /**
   * @param {appx.Document} data Document attributes.
   * @return {appx.Document}
   * @public
   */
  prepareData(data) {
    // Do nothing special in the standard editing controller.
    // Might be overridden in inheriting controllers.
    return data;
  }


  /**
   * @param {string} view_url URL of view page.
   * @param {string} index_url URL of index page.
   * @export
   */
  cancel(view_url, index_url) {
    const url = !view_url || this.isNewLang_ ? index_url : view_url;
    window.location.href = url;
  }


  /**
   * Called for instance when lon/lat inputs are modified.
   * @export
   */
  updateMap() {
    const data = this.scope[this.modelName];
    if ('lonlat' in data && data['lonlat']) {
      const lonlat = data['lonlat'];
      if ('longitude' in lonlat && 'latitude' in lonlat) {
        const point = new olGeomPoint([lonlat['longitude'], lonlat['latitude']]);
        point.transform(this.documentEditing.FORM_PROJ, this.documentEditing.DATA_PROJ);
        // If creating a new document, the model has no geometry attribute yet:
        data['geometry'] = data['geometry'] || {};
        data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(point);
        this.hasGeomChanged_ = true;
        this.scope.$root.$emit('documentDataChange', data);
      }
    }
  }


  /**
   * @param {Array.<ol.Feature>} features
   * @private
   */
  handleMapFeaturesChange_(features) {
    const data = this.scope[this.modelName];

    // If creating a new document, the model has no geometry attribute yet:
    data['geometry'] = data['geometry'] || {};

    if (features.length == 0) {
      data['geometry']['geom'] = null;
      data['geometry']['geom_detail'] = null;
      if (this.isPointType_()) {
        data['lonlat'] = null;
      }
    } else {
      const feature = features[0];
      const geometry = feature.getGeometry();
      googAsserts.assert(geometry);
      const isPoint = geometry instanceof olGeomPoint;
      if (isPoint) {
        data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(geometry);
        const coords = this.getCoordinatesFromPoint_(
          /** @type {ol.geom.Point} */ (geometry.clone()));
        data['lonlat'] = {
          'longitude': coords[0],
          'latitude': coords[1]
        };
        this.scope.$apply();
      } else {
        let center;
        // For lines, use the middle point as point geometry:
        if (geometry instanceof olGeomLineString) {
          center = geometry.getCoordinateAt(0.5);
        } else if (geometry instanceof olGeomMultiLineString) {
          center = geometry.getLineString(0).getCoordinateAt(0.5);
        } else {
          center = olExtent.getCenter(geometry.getExtent());
        }
        const centerPoint = new olGeomPoint(center);
        data['geometry']['geom'] = this.geojsonFormat_.writeGeometry(centerPoint);
        data['geometry']['geom_detail'] = this.geojsonFormat_.writeGeometry(geometry);
      }
    }

    this.hasGeomChanged_ = true;
  }


  /**
   * @param {Object} initialGeometry
   * @private
   */
  handleMapFeaturesReset_(initialGeometry) {
    const data = this.scope[this.modelName];
    data['geometry'] = initialGeometry;
    this.hasGeomChanged_ = false;
    this.updateGeometry_(data);
    this.scope.$root.$emit('documentDataChange', data);
  }


  /**
   * @param {ol.geom.Point} geometry
   * @return {ol.Coordinate}
   * @private
   */
  getCoordinatesFromPoint_(geometry) {
    geometry.transform(
      this.documentEditing.DATA_PROJ,
      this.documentEditing.FORM_PROJ
    );
    const coords = geometry.getCoordinates();
    return coords.map(coord => Math.round(coord * 1000000) / 1000000);
  }

  /**
   * @param {appx.Document} doc
   * @param {boolean} showError Whether alerts must be shown for detected errors.
   * Check what properties are missing and tell the user.
   * @export
   * @return {boolean | undefined}
   */
  hasMissingProps(doc, showError) {
    const type = doc.type ? this.utilsService.getDoctype(doc.type) : this.module_;
    const requiredFields = this.REQUIRED_FIELDS[type] || null;
    if (!requiredFields) {
      return false;
    }
    // understandable structure by alertService
    const missing = {'data': {'errors': []}};
    let hasError;
    let field;
    for (let i = 0; i < requiredFields.length; i++) {
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
  }


  /**
   *
   * @param {Object} object
   * @param {string} property
   * @param {string} value
   * @param {goog.events.Event | jQuery.Event} event
   * @export
   */
  pushToArray(object, property, value, event) {
    this.utilsService.pushToArray(object, property, value, event);
  }


  /**
   * Set the orientation of a document. Can have multiple orientations
   * @param {string} orientation
   * @param {appx.Document} document
   * @param {goog.events.Event | jQuery.Event} e
   * @export
   */
  toggleOrientation(orientation, document, e) {
    this.utilsService.pushToArray(document, 'orientations', orientation, e);
  }


  /**
   * @export
   */
  preview() {
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      }
    };
    const url = '/' + this.module_ + '/preview';
    let data = angular.copy(this.scope[this.modelName]);
    data = {
      'document': this.prepareData(data)
    };
    this.http_.post(url, data, config).
      catch((response) => {
        this.alerts.addError('A server error prevented creating the preview');
      }).
      then((response) => {
        const template = angular.element('#preview-container').clone();
        template.find('.preview-container-content').append(response['data']);

        this.modal.open({
          animation: true,
          template: this.compile(template)(this.scope),
          controller: 'PreviewModalController',
          controllerAs: 'previewModalCtrl',
          size: 'xl'
        });
      });
  }


  /**
   * @export
   */
  confirmSave(isValid) {
    if (!isValid) {
      this.alerts.addError('Form is not valid');
      return;
    }

    const data = this.scope[this.modelName];
    const score = this.presetQuality(data);
    this.storeQuality(data, score);

    const template = angular.element('#save-confirmation-modal').clone();
    const modalInstance = this.modal.open({
      animation: true,
      template: this.compile(template)(this.scope),
      controller: 'ConfirmSaveModalController as saveCtrl'
    });

    modalInstance.result.then((res) => {
      if (res) {
        this.scope[this.modelName]['message'] = res.message;
        this.scope[this.modelName]['quality'] = res.quality;
        this.submitForm(isValid);
      }
    });
  }


  /**
   * @param {string} selector
   * @param {string} sizem
   * @export
   */
  openModal(selector, sizem) {
    const template = $(selector).clone();
    this.modal.open({
      animation: true,
      size: sizem || 'lg',
      template: this.compile(template)(this.scope)
    });
  }

  /**
   * @param {appx.Document} doc Document attributes.
   * @return {number}
   */
  presetQuality(doc) {
    // Do nothing special in the standard editing controller.
    // Will be overridden in inheriting controllers.
    return 1;
  }

  /**
   * @param {appx.Document} doc Document attributes.
   * @param {number} score
   */
  storeQuality(doc, score) {
    switch (score) {
      case 0:
        doc['quality'] = 'empty';
        break;
      case 1:
        doc['quality'] = 'draft';
        break;
      case 2:
        doc['quality'] = 'medium';
        break;
      case 3:
        doc['quality'] = 'fine';
        break;
      case 4:
        doc['quality'] = 'great';
        break;
      default:
        doc['quality'] = 'draft';
    }
  }
}
