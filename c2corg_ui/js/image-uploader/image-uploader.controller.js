import angular from 'angular';
import olCoordinate from 'ol/coordinate';
import olExtent from 'ol/extent';
import olProj from 'ol/proj';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$q} $q promise
 * @param {app.Api} ApiService Api service.
 * @param {app.Alerts} appAlerts
 * @param {app.Document} DocumentService service
 * @param {String} imageUrl URL to the image backend.
 * @param {app.Url} appUrl
 * @param {app.Authentication} AuthenticationService
 * @constructor
 * @struct
 * @ngInject
 */
export default class ImageUploaderController {
  constructor($scope, $uibModal, $compile, $q, appAlerts, ApiService, DocumentService, imageUrl, appUrl,
    AuthenticationService, UtilsService) {
    'ngInject';

    this.utilsService_ = UtilsService;

    /**
     * @type {app.Document}
     * @export
     */
    this.documentService = DocumentService;

    /**
     * @type {Object} angular bootstrap modal
     * @private
     */
    this.modal_ = $uibModal;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.auth_ = AuthenticationService;

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
  }


  /**
   * @private
   */
  processFiles_() {
    this.areAllUploaded = false;
    let file;

    for (let i = 0; i < this.files.length; i++) {
      file = this.files[i];
      if (!file['metadata']) {
        angular.extend(file, {
          'src': this.utilsService_.getImageFileBase64Source(file),
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
  }

  /**
   * @private
   */
  upload_() {
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
  }


  /**
   * @private
   */
  uploadFile_(file) {
    const canceller = this.q_.defer();
    const promise = this.apiService_.uploadImage(file, canceller.promise, ((file, event) => {
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
  }


  /**
   * Lets showing the 'save' button when all images have been uploaded.
   * @private
   */
  areAllUploadedCheck_() {
    let file;
    for (let i = 0; i < this.files.length; i++) {
      file = this.files[i];
      if (!file['processed']) {
        this.areAllUploaded = false;
        return;
      }
    }
    this.areAllUploaded = this.files.length > 0;
  }


  /**
   * Save images and update their metadatas
   * @export
   */
  save() {
    const defer = this.q_.defer();

    this.apiService_.createImages(this.files, this.documentService.document)
      .then((data) => {
        const images = data['config']['data']['images'];
        const imageIds = data['data']['images']; // newly created document_id

        $('.img-container').each((i) => {
          const id = imageIds[i]['document_id'];
          images[i]['image_id'] = 'image-' + id;
          const element = this.utilsService_.createImageSlide(images[i], this.imageUrl_);
          $('.photos').append(element);

          const scope = this.scope_.$new(true);
          scope['photo'] = images[i];
          scope['photo']['image_id'] = 'image-' + id;
          this.documentService.document.associations['images'].push(scope['photo']);
          this.compile_($('#image-' + id).contents())(scope); // compile the figure thumbnail with <c2c-slide-info>

        });

        defer.resolve();
      }, () => {
        defer.reject();
      });

    return defer.promise;
  }


  /**
   * Sets a default image type = same as the document the image is being uploaded to.
   * @private
   * @return {string}
   */
  setImageType_() {
    const type = this.utilsService_.getDoctype(this.documentService.document.type);
    const isColl = this.documentService.isCollaborative(type);
    return isColl ? 'collaborative' : 'personal';
  }


  /**
   * @param {File} file
   * @export
   */
  retryFileUpload(file) {
    file['failed'] = false;
    file['queued'] = true;
    this.upload_();
  }


  /**
   * @param {File} file
   * @export
   */
  abortFileUpload(file) {
    if (!file['queued'] && !file['failed']) {
      file['manuallyAborted'] = true;
      file['canceller'].resolve();
    }
    this.deleteImage(this.files.indexOf(file));
    this.areAllUploadedCheck_();
  }


  /**
  * @export
  */
  abortAllUploads() {
    this.files.forEach((file) => {
      this.abortFileUpload(file);
    });
  }


  /**
   * @export
   */
  deleteImage(index) {
    this.files.splice(index, 1);
    if (this.files.length === 0) {
      this.areAllUploaded = false;
    }
  }


  /**
   * @property {File} file image
   * @suppress {missingProperties}
   * @private
   */
  getImageMetadata_(file) {
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
  }


  /**
   * @param {File} file
   * @private
   */
  setExifData_(file) {
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
  }


  /**
   * @param {Object} exifData Exif data
   * @param {string} exifTag Exif tag.
   * @return {?string} Parsed date in ISO format.
   * @private
   */
  parseExifDate_(exifData, exifTag) {
    if (!exifData[exifTag]) {
      return null;
    }
    const exifDate = exifData[exifTag];
    const date = window.moment(exifDate, 'YYYY:MM:DD HH:mm:ss');
    return date.isValid() ? date.format() : null;
  }


  /**
   * @param {File} file
   * @private
   */
  setGeolocation_(file) {
    let lat = file['exif']['GPSLatitude'].split(',');
    let lon = file['exif']['GPSLongitude'].split(',');
    lat = this.utilsService_.convertDMSToDecimal(lat[0], lat[1], lat[2], file['exif']['GPSLatitudeRef']);
    lon = this.utilsService_.convertDMSToDecimal(lon[0], lon[1], lon[2], file['exif']['GPSLongitudeRef']);
    const worldExtent = olProj.get('EPSG:4326').getExtent();

    if (!isNaN(lat) && !isNaN(lon) && olExtent.containsXY(worldExtent, lon, lat)) {
      const location = olProj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
      const geom = {'coordinates': location, 'type': 'Point'};

      file['metadata']['geometry'] = {'geom': JSON.stringify(geom)};
      file['exif']['geo_label'] = olCoordinate.toStringHDMS([lon, lat]);
    }

    const elevation = parseFloat(file['exif']['GPSAltitude']);
    if (!isNaN(elevation)) {
      file['metadata']['elevation'] = elevation;
    }
  }


  /**
   * @export
   */
  openModal() {
    const template = $('#image-uploader').clone();
    this.modal_.open({
      animation: true,
      template: this.compile_(template)(this.scope_),
      controller: 'AppImageUploaderModalController as imageModalCtrl',
      size: 'xl'
    });
  }


  /**
   * @param {Object} object
   * @param {string} property name
   * @param {string} value category
   * @param {jQuery.Event | goog.events.Event} event click
   * @export
   */
  selectOption(object, property, value, event) {
    event.stopPropagation();
    this.utilsService_.pushToArray(object, property, value, event);
  }


  /**
   * @param {Object} file
   * @param {number} width Width of uploaded image.
   * @param {number} height Height of uploaded image.
   * @return {boolean}
   * @export
   */
  resizeIf(
    file, width, height) {
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      return file.size > 2 * 1024 * 1024; /** 2 MB */
    }
    return false;
  }


  /**
   * @param {Array.<string>} imageTypes
   * @return {Array.<string>}
   * @export
   */
  filterImageTypes(imageTypes) {
    if (this.auth_.isModerator()) {
      // moderators have access to all image types
      return imageTypes;
    }
    const removeCopyright = function(val) {
      return val !== 'copyright';
    };
    return imageTypes.filter(removeCopyright);
  }
}
