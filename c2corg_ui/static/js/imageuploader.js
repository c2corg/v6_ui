goog.provide('app.ImageUploaderController');
goog.provide('app.imageUploaderDirective');
goog.provide('app.ImageUploaderModalController');

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
 * @param {app.Document} appDocument service
 * @param {String} imageUrl URL to the image backend.
 * @param {app.Url} appUrl
 * @constructor
 * @struct
 * @ngInject
 */
app.ImageUploaderController = function($scope, $uibModal, $compile, $q, appAlerts, appApi, appDocument, imageUrl, appUrl) {

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

  $scope.$on('modal.closing', function(event, reason, closed) {
    this.scope_['uplCtrl'].abortAllUploads();
  }.bind(this));
};


/**
 * @export
 */
app.ImageUploaderModalController.prototype.close = function() {
  this.modalInstance_.close();
};


/**
 * @export
 */
app.ImageUploaderModalController.prototype.save = function() {
  this.scope_['uplCtrl'].save().then(function() {
    this.modalInstance_.close();
  }.bind(this));
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
      this.uploadFile_(file);
    }
  }
  this.areAllUploadedCheck_(interval);
};


/**
 * @private
 */
app.ImageUploaderController.prototype.uploadFile_ = function(file) {
  angular.extend(file, {
    'src': app.utils.getImageFileBase64Source(file),
    'progress': 0,
    'processed': false,
    'metadata': {
      'id': file['name'] + '-' + new Date().toISOString(),
      'activities': [],
      'categories': []
    }
  });
  this.getImageMetadata_(file);

  var canceller = this.q_.defer();
  var promise = this.api_.uploadImage(file, canceller.promise, function(file, event) {
    var progress = event.loaded / event.total;
    file['progress'] = 100 * progress;
  }.bind(this, file));

  file['uploading'] = promise;
  file['canceller'] = canceller;

  promise.then(function(resp) {
    var image = new Image();
    image['src'] = file['src'];

    file['metadata']['filename'] = resp['data']['filename'];
    file['processed'] = true;

  }.bind(this), function(resp) {
    if (resp.status === -1) {
      if (!file['manuallyAborted']) {
        this.alerts_.addError(this.alerts_.gettext('Error while uploading the image:') + ' Timeout');
      }
    } else {
      this.alerts_.addError(this.alerts_.gettext('Error while uploading the image:') + ' ' + resp.statusText);
    }
    this.deleteImage(this.files.indexOf(file));
  }.bind(this));
};


/**
 * Lets showing the 'save' button when all images have been uploaded.
 * @param {null | number | null} interval
 * @private
 */
app.ImageUploaderController.prototype.areAllUploadedCheck_ = function(interval) {
  var promises = this.files.map(function(file) {
    return file['uploading'];
  });

  this.q_.all(promises).then(function(res) {
    if (this.files.length > 0) {
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
  var defer = this.q_.defer();

  this.api_.createImages(this.files, this.documentService.document)
  .then(function(data) {
    var id;
    var images = data['config']['data']['images'];
    var imageIds = data['data']['images']; // newly created document_id

    $('.img-container').each(function(i) {
      id = 'image-' + (+new Date());
      images[i]['image_id'] = id;

      var element = app.utils.createImageSlide(images[i], this.imageUrl_);
      $('.photos').slick('slickAdd', element, true);

      var scope = this.scope_.$new(true);
      scope['photo'] = images[i];
      scope['photo']['image_id'] = id;
      scope['photo']['edit_url'] = '/images/edit/' + imageIds[i]['document_id'] + '/' + images[i]['locales'][0]['lang'];
      scope['photo']['view_url'] = this.url_.buildDocumentUrl('images', imageIds[i]['document_id'], images[i]['locales'][0], images[i]['locales'][0]['lang'] );
      this.documentService.document.associations['images'].push(scope['photo']);
      this.compile_($('#' + id).contents())(scope);
    }.bind(this));

    defer.resolve();
  }.bind(this), function() {
    defer.reject();
  });

  return defer.promise;
};


/**
 * @param {Object} file
 * @export
 */
app.ImageUploaderController.prototype.abortFileUpload = function(file) {
  file['manuallyAborted'] = true;
  file['canceller'].resolve();
};


/**
* @export
*/
app.ImageUploaderController.prototype.abortAllUploads = function() {
  this.files.forEach(function(file) {
    this.abortFileUpload(file);
  }.bind(this));
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
  window.loadImage.parseMetaData(file, function(data) {
    var exif = data.exif;
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
