goog.provide('app.ImageEditingController');

goog.require('app');
goog.require('app.DocumentEditingController');
goog.require('app.Document');


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
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
 * @export
 */
app.ImageEditingController = function($scope, $element, $attrs, appLang,
        appAuthentication, ngeoLocation, appAlerts, appApi, authUrl,
        appDocument, appUrl, imageUrl) {

  goog.base(this, $scope, $element, $attrs, appLang, appAuthentication,
          ngeoLocation, appAlerts, appApi, authUrl, appDocument, appUrl, imageUrl);

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

};
goog.inherits(app.ImageEditingController, app.DocumentEditingController);


/**
 * @param {number} value
 * @export
 */
app.ImageEditingController.prototype.convertExposureTime = function(value) {
  var exposure = this['scope']['image']['exposure_time_converted'];
  if (value === 0) {
    this.exposureError = true;
    exposure = '';
    return;
  } else if (value < 1 && value) {
    exposure = '1/' + (1 / value) + ' s';
  } else if (value >= 1) {
    exposure = value + ' s';
  } else if (!value) {
    exposure = '';
  }
  this.exposureError = false;
};


/**
 * @export
 * @param {string} filename
 * @return {string}
 */
app.ImageEditingController.prototype.createImgUrl = function(filename) {
  return this.imageUrl_ + app.utils.createImageUrl(filename, 'BI');
};

app.module.controller('appImageEditingController', app.ImageEditingController);
