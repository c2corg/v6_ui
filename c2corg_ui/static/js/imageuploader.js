goog.provide('app.ImageUploaderController');
goog.provide('app.imageUploaderDirective');
goog.provide('app.ImageUploaderModalController');

goog.require('app');
goog.require('ol.coordinate');


/**
 * This directive is used to display a drag-drop area for images to upload.
 * @return {angular.Directive} The directive specs.
 */
app.imageUploaderDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppImageUploaderController',
    controllerAs: 'uplCtrl',
    bindToController: {
      'activities': '=',
      'categories': '=',
      'types': '='
    },
    templateUrl: '/static/partials/imageuploader.html',
    link: function(scope, el, attrs, ctrl) {
      el.on('click', '.dropdown-toggle', function() {
        app.utils.repositionMenu({'menu': this, 'boxBoundEl': '.images-container', 'checkBottom': true});
      });
    }
  };
};


app.module.directive('appImageUploader', app.imageUploaderDirective);


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$q} $q promise
 * @param {app.Api} appApi Api service.
 * @param {app.Alerts} appAlerts
 * @param {app.Document} appDocument service
 * @param {String} imageUrl URL to the image backend.
 * @param {app.Url} appUrl
 * @param {app.Authentication} appAuthentication
 * @constructor
 * @struct
 * @ngInject
 */
app.ImageUploaderController = function($scope, $uibModal, $compile, $q,
  appAlerts, appApi, appDocument, imageUrl, appUrl, appAuthentication) {

  /**
   * @type {app.Document}
   * @export
   */
  this.documentService = appDocument;

  /**
   * @type {Object} angular bootstrap modal
   * @private
   */
  this.modal_ = $uibModal;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

  /**
   * @type {String}
   * @private
   */
  this.imageUrl_ = imageUrl;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {angular.$compile}
   * @private
   */
  this.compile_ = $compile;

  /**
   * @type {angular.$q}
   * @private
   */
  this.q_ = $q;

  /**
   * @type {Array.<File>}
   * @export
   */
  this.files = [];

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {Array.<string>}
   * @export
   */
  this.activities;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.defaultActivities_ = this.documentService.document.activities || [];

  /**
   * @type {Array.<string>}
   * @export
   */
  this.types;

  /**
   * @type {Array.<string>}
   * @export
   */
  this.categories;

  /**
   * @type {string}
   * @private
   */
  this.image_type_ = this.setImageType_();

  /**
   * @type {Object}
   * @export
   */
  this.resizeOptions = {'width': 2048, 'height': 2048, 'quality': 0.9};

  /**
   * @type {boolean}
   * @export
   */
  this.saving = false;

  this.scope_['activities'] = this.activities;
  this.scope_['types'] = this.types;
  this.scope_['categories'] = this.categories;

  this.scope_.$watch(() => {
    return this.files;
  }, () => {
    if (this.files.length) {
      this.processFiles_();
    }
  });

  /**
   * @type {boolean}
   * @export
   */
  this.areAllUploaded = false;
};


/**
 * @private
 */
app.ImageUploaderController.prototype.processFiles_ = function() {
  this.areAllUploaded = false;
  let file;

  for (let i = 0; i < this.files.length; i++) {
    file = this.files[i];
    if (!file['metadata']) {
      angular.extend(file, {
        'src': app.utils.getImageFileBase64Source(file),
        'queued': true,
        'progress': 0,
        'processed': false,
        'metadata': {
          'id': file['name'] + '-' + new Date().toISOString(),
          'activities': angular.copy(this.defaultActivities_),
          'categories': [],
          'image_type': this.image_type_,
          'elevation': null,
          'geometry': null
        }
      });
      this.getImageMetadata_(file);
    }
  }

  this.upload_();
};

/**
 * @private
 */
app.ImageUploaderController.prototype.upload_ = function() {
  let file;

  for (let i = 0; i < this.files.length; i++) {
    file = this.files[i];

    // avoid uploading multiple files at the same time
    if (!file['queued'] && !file['processed'] && !file['failed']) {
      return;
    }

    if (file['queued']) {
      this.uploadFile_(file).then(() => {
        this.upload_();
      });
      return;
    }
  }

  this.areAllUploadedCheck_();
};


/**
 * @private
 */
app.ImageUploaderController.prototype.uploadFile_ = function(file) {
  const canceller = this.q_.defer();
  const promise = this.api_.uploadImage(file, canceller.promise, ((file, event) => {
    const progress = event.loaded / event.total;
    file['progress'] = 100 * progress;
  }).bind(this, file));

  file['queued'] = false;
  file['uploading'] = promise;
  file['canceller'] = canceller;

  return promise.then((resp) => {
    const image = new Image();
    image['src'] = file['src'];

    file['metadata']['filename'] = resp['data']['filename'];
    file['processed'] = true;

  }, (resp) => {
    if (file['manuallyAborted']) {
      return;
    }
    if (resp.status === -1) {
      file['failed'] = 'Timeout';
    } else {
      file['failed'] = resp.statusText;
    }
    file['progress'] = 0;
  });
};


/**
 * Lets showing the 'save' button when all images have been uploaded.
 * @private
 */
app.ImageUploaderController.prototype.areAllUploadedCheck_ = function() {
  let file;
  for (let i = 0; i < this.files.length; i++) {
    file = this.files[i];
    if (!file['processed']) {
      this.areAllUploaded = false;
      return;
    }
  }
  this.areAllUploaded = this.files.length > 0;
};


/**
 * Save images and update their metadatas
 * @export
 */
app.ImageUploaderController.prototype.save = function() {
  const defer = this.q_.defer();

  this.api_.createImages(this.files, this.documentService.document)
    .then((data) => {
      const images = data['config']['data']['images'];
      const imageIds = data['data']['images']; // newly created document_id

      $('.img-container').each((i) => {
        const id = imageIds[i]['document_id'];
        images[i]['image_id'] = 'image-' + id;
        const element = app.utils.createImageSlide(images[i], this.imageUrl_);
        $('.photos').append(element);

        const scope = this.scope_.$new(true);
        scope['photo'] = images[i];
        scope['photo']['image_id'] = 'image-' + id;
        this.documentService.document.associations['images'].push(scope['photo']);
        this.compile_($('#image-' + id).contents())(scope); // compile the figure thumbnail with <app-slide-info>

      });

      defer.resolve();
    }, () => {
      defer.reject();
    });

  return defer.promise;
};


/**
 * Sets a default image type = same as the document the image is being uploaded to.
 * @private
 * @return {string}
 */
app.ImageUploaderController.prototype.setImageType_ = function() {
  const type = app.utils.getDoctype(this.documentService.document.type);
  const isColl = this.documentService.isCollaborative(type);
  return isColl ? 'collaborative' : 'personal';
};


/**
 * @param {File} file
 * @export
 */
app.ImageUploaderController.prototype.retryFileUpload = function(file) {
  file['failed'] = false;
  file['queued'] = true;
  this.upload_();
};


/**
 * @param {File} file
 * @export
 */
app.ImageUploaderController.prototype.abortFileUpload = function(file) {
  if (!file['queued'] && !file['failed']) {
    file['manuallyAborted'] = true;
    file['canceller'].resolve();
  }
  this.deleteImage(this.files.indexOf(file));
  this.areAllUploadedCheck_();
};


/**
* @export
*/
app.ImageUploaderController.prototype.abortAllUploads = function() {
  this.files.forEach((file) => {
    this.abortFileUpload(file);
  });
};


/**
 * @export
 */
app.ImageUploaderController.prototype.deleteImage = function(index) {
  this.files.splice(index, 1);
  if (this.files.length === 0) {
    this.areAllUploaded = false;
  }
};


/**
 * @property {File} file image
 * @suppress {missingProperties}
 * @private
 */
app.ImageUploaderController.prototype.getImageMetadata_ = function(file) {
  window.loadImage.parseMetaData(file, (data) => {
    const exif = data.exif;
    if (exif) {
      file['exif'] = exif.getAll();

      this.setExifData_(file);
      if (file['exif']['GPSLatitude']) {
        this.setGeolocation_(file);
      }
    }
  });
};


/**
 * @param {File} file
 * @private
 */
app.ImageUploaderController.prototype.setExifData_ = function(file) {
  const exif = file['exif'];
  const metadata = file['metadata'];

  let date = this.parseExifDate_(exif, 'DateTimeOriginal');
  if (date === null) {
    date = this.parseExifDate_(exif, 'DateTime');
  }
  metadata['date_time'] = date;
  metadata['exposure_time'] = exif['ExposureTime'];
  metadata['iso_speed'] = exif['PhotographicSensitivity'];
  metadata['focal_length'] = exif['FocalLengthIn35mmFilm'];
  metadata['fnumber'] = exif['FNumber'];
  metadata['camera_name'] = (exif['Make'] && exif['Model']) ? (exif['Make'] + ' ' + exif['Model']) : null;
};


/**
 * @param {Object} exifData Exif data
 * @param {string} exifTag Exif tag.
 * @return {?string} Parsed date in ISO format.
 * @private
 */
app.ImageUploaderController.prototype.parseExifDate_ = function(exifData, exifTag) {
  if (!exifData[exifTag]) {
    return null;
  }
  const exifDate = exifData[exifTag];
  const date = window.moment(exifDate, 'YYYY:MM:DD HH:mm:ss');
  return date.isValid() ? date.format() : null;
};


/**
 * @param {File} file
 * @private
 */
app.ImageUploaderController.prototype.setGeolocation_ = function(file) {
  let lat = file['exif']['GPSLatitude'].split(',');
  let lon = file['exif']['GPSLongitude'].split(',');
  lat = app.utils.convertDMSToDecimal(lat[0], lat[1], lat[2], file['exif']['GPSLatitudeRef']);
  lon = app.utils.convertDMSToDecimal(lon[0], lon[1], lon[2], file['exif']['GPSLongitudeRef']);
  const worldExtent = ol.proj.get('EPSG:4326').getExtent();

  if (!isNaN(lat) && !isNaN(lon) && ol.extent.containsXY(worldExtent, lon, lat)) {
    const location = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    const geom = {'coordinates': location, 'type': 'Point'};

    file['metadata']['geometry'] = {'geom': JSON.stringify(geom)};
    file['exif']['geo_label'] = ol.coordinate.toStringHDMS([lon, lat]);
  }

  const elevation = parseFloat(file['exif']['GPSAltitude']);
  if (!isNaN(elevation)) {
    file['metadata']['elevation'] = elevation;
  }
};


/**
 * @export
 */
app.ImageUploaderController.prototype.openModal = function() {
  const template = $('#image-uploader').clone();
  this.modal_.open({
    animation: true,
    template: this.compile_(template)(this.scope_),
    controller: 'AppImageUploaderModalController as imageModalCtrl',
    size: 'xl'
  });
};


/**
 * @param {Object} object
 * @param {string} property name
 * @param {string} value category
 * @param {jQuery.Event | goog.events.Event} event click
 * @export
 */
app.ImageUploaderController.prototype.selectOption = function(object, property, value, event) {
  event.stopPropagation();
  app.utils.pushToArray(object, property, value, event);
};


/**
 * @param {Object} file
 * @param {number} width Width of uploaded image.
 * @param {number} height Height of uploaded image.
 * @return {boolean}
 * @export
 */
app.ImageUploaderController.prototype.resizeIf = function(
  file, width, height) {
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    return file.size > 2 * 1024 * 1024; /** 2 MB */
  }
  return false;
};


/**
 * @param {Array.<string>} imageTypes
 * @return {Array.<string>}
 * @export
 */
app.ImageUploaderController.prototype.filterImageTypes = function(imageTypes) {
  if (this.auth_.isModerator()) {
    // moderators have access to all image types
    return imageTypes;
  }
  const removeCopyright = function(val) {
    return val !== 'copyright';
  };
  return imageTypes.filter(removeCopyright);
};


app.module.controller('AppImageUploaderController', app.ImageUploaderController);


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.ImageUploaderModalController}
 */
app.ImageUploaderModalController = function($scope, $uibModalInstance) {

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;

  $scope.$on('modal.closing', (event, reason, closed) => {
    this.scope_['uplCtrl'].abortAllUploads();
  });
};


/**
 * @export
 */
app.ImageUploaderModalController.prototype.close = function() {
  if (!this.scope_['uplCtrl'].saving) {
    this.modalInstance_.close();
  }
};


/**
 * @export
 */
app.ImageUploaderModalController.prototype.save = function() {
  const uplCtrl = this.scope_['uplCtrl'];
  if (uplCtrl.saving) {
    // saving is already in progress
    return;
  }
  uplCtrl.saving = true;
  uplCtrl.save().then(() => {
    uplCtrl.saving = false;
    this.modalInstance_.close();
  });
};


app.module.controller('AppImageUploaderModalController', app.ImageUploaderModalController);
