goog.provide('app.ImageUploaderController');
goog.provide('app.imageUploaderDirective');
goog.provide('app.ImageUploaderModalController')
goog.require('app');


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
      'activities' : '=',
      'categories': '=',
      'types': '='
    },
    templateUrl: '/static/partials/imageuploader.html',
    link: function(scope, el, attrs, ctrl) {
      // dropdown-menus can overlap the modal and it's impossible to fix it with overflow-y: srcoll + overflow-x: visible.
      el.on('click', '.dropdown-toggle', function() {
        ctrl.repositionMenu_(this);
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
 * @param {Object} Upload ng-file-upload Upload service.
 * @param {app.Document} appDocument service
 * @constructor
 * @struct
 * @ngInject
 */
app.ImageUploaderController = function($scope, Upload, $uibModal, $compile, $q, appAlerts, appApi, appDocument) {

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
   * @private
   */
  this.Upload_ = Upload;

  /**
   * @type {Array.<angular.$q.Promise>}
   * @export
   */
  this.uploading = [];

  /**
   * @type {Array.<!angular.$q.Deferred>}
   * @export
   */
  this.cancellers = [];

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
   * @export
   */
  this.types;

  /**
   * @type {Array.<string>}
   * @export
   */
  this.categories;

  this.scope_['activities'] = this.activities;
  this.scope_['types'] = this.types;
  this.scope_['categories'] = this.categories;

  this.scope_.$watch(function() {
    return this.files;
  }.bind(this), function() {
    if (this.files.length) {
      this.upload_();
    }
  }.bind(this));

  /**
   * @type {boolean}
   * @export
   */
  this.areAllUploaded = false;
};


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModalInstance modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.ImageUploaderModalController}
 */
app.ImageUploaderModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
};


/**
 * @export
 */
app.ImageUploaderModalController.prototype.close = function() {
  this.modalInstance_.close();
};


/**
 * @private
 */
app.ImageUploaderController.prototype.upload_ = function() {
  this.areAllUploaded = false;
  var file;

  var interval = setInterval(function() {
    this.scope_.$apply();
  }.bind(this), 1000);

  for (var i = 0; i < this.files.length; i++) {

    file = this.files[i];

    if (!file['metadata']) {
      angular.extend(file, {
        'src': app.utils.getImageFileBase64Source(file),
        'progress': 0,
        'metadata': {
          'title': file['name'],
          'id': file['name'] + '-' + new Date().toISOString()
        }
      });

      this.getImageMetadata_(file);

      var canceller = this.q_.defer();
      var promise = this.api_.uploadImage(file, canceller.promise, function(file, event) {
        var progress = event.loaded / event.total;
        file['progress'] = 100 * progress;
        console.log('progress', 100 * progress, file['metadata']['id']);
      }.bind(this, file));
      this.uploading[i] = promise;
      this.cancellers.push(canceller);

      promise.then(function(resp) {
        console.log('100% uploaded! ' + file['metadata']['title'] + ' ' + i);
      }.bind(this), function(resp) {
        this.alerts_.addError('error while uploading the image ' + resp);
      }.bind(this));
    }
  }
  this.areAllUploadedCheck_(interval);
};


/**
 * Lets showing the 'save' button when all images have been uploaded.
 * @param {null | number | null} interval
 * @private
 */
app.ImageUploaderController.prototype.areAllUploadedCheck_ = function(interval) {
  this.q_.all(this.cancellers).then(function(res) {
    if (this.files.length > 0 && (this.files.length === this.cancellers.length || this.cancellers.length >= this.cancellers.length)) {
      this.areAllUploaded = true;
      clearInterval(interval);
    } else {
      this.areAllUploaded = false;
    }
  }.bind(this));
};


/**
 * Save images and update their metadatas
 * @export
 */
app.ImageUploaderController.prototype.save = function() {
  var meta;
  var id;

  $('.img-container').each(function(i, image) {
    meta = this.files[i]['metadata'];
    id = 'image-' + (+new Date());
    this.files[i]['document_id'] = id;

    var element = app.utils.createImageSlide(this.files[i]);
    $('.photos').slick('slickAdd', element);

    var scope = this.scope_.$new(true);
    scope['photo'] = {
      'filename' : meta['filename'],
      'locales' : [{'title': meta['title']}],
      'date_time': meta['DateTime'],
      'activities' : meta['activities'],
      'iso_speed' : meta['PhotographicSensitivity'],
      'image_type' : meta['image_type'],
      'fnumber' : meta['FocalLength'],
      'camera_name' : meta['Make'] + ' ' + meta['Model'],
      'categories': meta['categories'],
      'document_id': id
    };
    this.documentService.document.associations['images'].push(scope['photo']);
    this.compile_($('#image-' + id).contents())(scope);

  }.bind(this));
  $('.modal, .modal-backdrop').remove();
  this.api_.saveImages(this.files);
};


/**
 * @param {number} index
 * @export
 */
app.ImageUploaderController.prototype.abortUploadingImage = function(index) {
  this.uploading.splice(index, 1);
  this.files.splice(index, 1);
  var canceller = this.cancellers.splice(index, 1)[0];
  canceller.reject(); // cancel
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
 * @property {Object} file image
 * @suppress {missingProperties}
 * @private
 */
app.ImageUploaderController.prototype.getImageMetadata_ = function(file) {
  window.loadImage.parseMetaData(file, function(data) {
    var exif = data['exif'];
    if (exif) {
      angular.extend(file['metadata'], exif.getAll());
      return;
    }
  });
};


/**
 * @export
 */
app.ImageUploaderController.prototype.addGeoinfo = function(doc, file) {
  file['metadata']['geo'] = doc;
};


/**
 * @export
 */
app.ImageUploaderController.prototype.openModal = function() {
  var template = $('#image-uploader').clone();
  this.modal_.open({
    animation: true,
    template: this.compile_(template)(this.scope_),
    controller: 'AppImageUploaderModalController as imageModalCtrl',
    size: 'xl'
  });
};


/**
 * @param {HTMLElement} el
 * @private
 */
app.ImageUploaderController.prototype.repositionMenu_ = function(el) {
  var menu = $(el).next();
  menu.css('opacity', 0); // prevent from jumping on the screen
  setTimeout(function() { // because at the moment of the click the menu is hidden and result would give 0.
    var boxBounds = $('#image-uploader')[0].getBoundingClientRect();
    var menuBounds = menu[0].getBoundingClientRect();
    if (menuBounds.right > boxBounds.right) {
      menu.css('left', -Math.abs(menuBounds.right - boxBounds.right + 20));
    }
    menu.css('opacity', 1);
  }, 50);
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


app.module.controller('AppImageUploaderController', app.ImageUploaderController);
app.module.controller('AppImageUploaderModalController', app.ImageUploaderModalController);
