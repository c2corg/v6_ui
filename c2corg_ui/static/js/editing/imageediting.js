goog.provide('app.ImageEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Document');


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
 * @extends {app.DocumentEditingController}
 * @ngInject
 */
app.ImageEditingController = function($scope, $element, $attrs, $http,
  $uibModal, $compile, appLang, appAuthentication, ngeoLocation, appAlerts,
  appApi, authUrl, appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, $http, $uibModal, $compile,
    appLang, appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
    appDocument, appUrl, imageUrl);

  /**
   * @type {Date}
   * @export
   */
  this.today = new Date();

  /**
   * @type {string}
   * @private
   */
  this.imageUrl_ = imageUrl;

  /**
   * @type {boolean}
   * @export
   */
  this.exposureError = false;

  /**
   * @type {?string}
   * @export
   */
  this.initialImageType = null;
};
goog.inherits(app.ImageEditingController, app.DocumentEditingController);


/**
 * @param {appx.Document} data
 * @return {appx.Document}
 * @override
 * @public
 */
app.ImageEditingController.prototype.filterData = function(data) {
  // Image's date has to be converted to Date object because uib-datepicker
  // will treat it as invalid -> invalid form.
  data['date_time'] = new Date(data['date_time']);
  this.initialImageType = data['image_type'];
  return data;
};


/**
 * @param {number} value
 * @export
 */
app.ImageEditingController.prototype.convertExposureTime = function(value) {
  let exposure;

  if (value === 0) {
    this.exposureError = true;
    this['scope']['image']['exposure_time_converted'] = '';
    return;
  } else if (value < 1 && value) {
    exposure = '1/' + Math.round(1 / value) + ' s';
  } else if (value >= 1) {
    exposure = value + ' s';
  } else if (!value) {
    exposure = '';
  }
  this.exposureError = false;
  this['scope']['image']['exposure_time_converted'] = exposure;
};


/**
 * @export
 * @param {string} filename
 * @return {string}
 */
app.ImageEditingController.prototype.createImgUrl = function(filename) {
  return this.imageUrl_ + app.utils.createImageUrl(filename, 'BI');
};


/**
 * @param {Array.<string>} imageTypes
 * @return {Array.<string>}
 * @export
 */
app.ImageEditingController.prototype.filterImageTypes = function(imageTypes) {
  const removeCopyright = function(val) {
    return val !== 'copyright';
  };
  return imageTypes.filter(removeCopyright);
};

/**
 * @param {appx.Document} doc Document attributes.
 * @return {number}
 * @override
 */
app.ImageEditingController.prototype.presetQuality = function(doc) {
  let score = 0;

  if ('title' in doc.locales[0] && doc.locales[0]['title']) {
    score++;
  }

  if ('description' in doc.locales[0] && doc.locales[0]['description']) {
    score++;
  }

  if ('geometry' in doc && doc['geometry']) {
    const geometry = doc['geometry'];
    if ('geom' in geometry && geometry['geom']) {
      score++;
    }
  }

  if ('activities' in doc && doc['activities'].length) {
    score = score + 0.5;
  }

  if ('categories' in doc && doc['categories'].length) {
    score = score + 0.5;
  }

  if (doc['associations']['waypoints'].length || doc['associations']['routes'].length ||
      ('date_time' in doc && doc['date_time'])) {
    score = score + 0.5;
  }

  score = Math.floor(score);
  return score;
};

app.module.controller('appImageEditingController', app.ImageEditingController);
