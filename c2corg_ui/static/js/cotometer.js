goog.provide('app.CotometerDirective');
goog.provide('app.CotometerController');

goog.require('app');

/**
 * This directive is used to manage the dialog of cotometer
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.CotometerDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppCotometerController',
    controllerAs: 'cotmetCtrl',
    templateUrl: '/static/partials/cotometer.html',
    bindToController: {
      'module': '<',
      'lang': '@'
    }
  };
};

app.module.directive('appCotometer', app.CotometerDirective);


/**
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {app.Api} appApi appApi.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
app.CotometerController = function(appApi, gettextCatalog, $uibModalStack) {

  /**
   * @type {string}
   * @export
   */
  this.rating;

  /**
   * @type {number}
   * @export
   */
  this.skiability;

  /**
   * @type {number}
   * @export
   */
  this.slope;

  /**
   * @type {number}
   * @export
   */
  this.elevation;

  /**
   * @type {app.Api}
   * @private
   */
  this.appApi_ = appApi;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {ui.bootstrap.$modalStack}
   * @private
   */
  this.$uibModalStack_ = $uibModalStack;

  /**
   * @export
   * @type {string}
   */
  this.module;

  /**
   * @export
   * @type {string}
   */
  this.lang;
};


/**
 * @private
 */
app.CotometerController.prototype.cotometerRating = function() {

  var inter = Math.tan(Math.PI * this.slope / 180) + 0.1 * Math.log(this.elevation);
  inter += this.skiability.value * (inter - 1);
  if (inter < 1.32) this.rating = '≤3.3';
  else if (inter >= 1.32 & inter < 1.42) this.rating = '4.1';
  else if (inter >= 1.42 & inter < 1.5) this.rating = '4.2';
  else if (inter >= 1.5 & inter < 1.575) this.rating = '4.3';
  else if (inter >= 1.575 & inter < 1.67) this.rating = '5.1';
  else if (inter >= 1.67 & inter < 1.745) this.rating = '5.2';
  else if (inter >= 1.745 & inter < 1.81) this.rating = '5.3';
  else if (inter >= 1.81 & inter < 1.95) this.rating = '5.4';
  else if (inter >= 1.95 & inter < 2.09) this.rating = '5.5';
  else if (inter >= 2.09 & inter < 2.25) this.rating = '5.6';
  else if (inter >= 2.25 & inter < 2.4) this.rating = '5.7';
  else this.rating = '5.8';
};


/**
 * @export
 */
app.CotometerController.prototype.cotometerTechnicalGrade = function() {

  if (isNaN(this.skiability.value)) {
    alert('Vous devez choisir une skiabilité');
    return false;
  }

  if (isNaN(this.slope) || this.slope < 20.0 || this.slope > 80.0) {
    alert('La pente doit être comprise entre 20° et 80°');
    return false;
  }

  if (isNaN(this.elevation) || this.elevation < 50.0 || this.elevation > 3000.0) {
    alert('Le dénivelé doit être compris entre 50m et 3000m');
    return false;
  }

  this.cotometerRating();
};


/**
 * @export
 */
app.CotometerController.prototype.closeDialog = function() {
  this.$uibModalStack_.dismissAll();
};

app.module.controller('AppCotometerController', app.CotometerController);

