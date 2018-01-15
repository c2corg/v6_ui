goog.provide('app.cotometerDirective');
goog.provide('app.CotometerController');

goog.require('app');

/**
 * This directive is used to manage the dialog of cotometer
 * cotometerRating function was developed and made available with the support of BLMS http://paleo.blms.free.fr
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cotometerDirective = function() {
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

app.module.directive('appCotometer', app.cotometerDirective);


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ui.bootstrap.$modalStack} $uibModalStack $uibModalStack.
 * @constructor
 * @ngInject
 */
app.CotometerController = function(gettextCatalog, $uibModalStack) {

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
   * @type {boolean}
   * @export
   */
  this.errorSlope;

  /**
   * @type {number}
   * @export
   */
  this.elevation;

  /**
   * @type {boolean}
   * @export
   */
  this.errorElevation;

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
app.CotometerController.prototype.cotometerRating_ = function() {

  let inter = Math.tan(Math.PI * this.slope / 180) + 0.1 * Math.log(this.elevation);
  inter += this.skiability * (inter - 1);
  const diff = (1 + this.skiability) * this.elevation;

  if (this.slope <= 17 && diff < 400) {
    this.rating = '1.1';
  } else if (this.slope <= 23 && diff < 650) {
    this.rating = '1.2';
  } else if (this.slope < 30 && diff < 800) {
    this.rating = '1.3';
  } else if ((this.slope < 35 && diff < 800) || (this.slope < 23 &&  diff > 800)) {
    this.rating = '2.1';
  } else if (this.slope < 35 && diff <= 950) {
    this.rating = '2.2';
  } else if (this.slope < 35 && diff > 950) {
    this.rating = '2.3';
  } else if (this.slope >= 35 && this.slope <= 40 && diff < 650) {
    this.rating = '3.1';
  } else if (this.slope >= 35 && this.slope <= 40 && diff <= 900) {
    this.rating = '3.2';
  } else if (this.slope >= 35 && this.slope <= 40 && diff > 900) {
    this.rating = '3.3';
  } else if (inter < 0.98) {
    this.rating = '1.1';
  } else if (inter >= 0.98 && inter < 1.02) {
    this.rating = '1.2';
  } else if (inter >= 1.03 && inter < 1.09) {
    this.rating = '+1.3';
  } else if (inter >= 1.09 && inter < 1.18) {
    this.rating = '+2.1';
  } else if (inter >= 1.18 && inter < 1.24) {
    this.rating = '2.2';
  } else if (inter >= 1.24 && inter < 1.30) {
    this.rating = '2.3';
  } else if (inter >= 1.30 && inter < 1.34) {
    this.rating = '3.1';
  } else if (inter >= 1.34 && inter < 1.39) {
    this.rating = '3.2';
  } else if (inter >= 1.39 && inter < 1.42) {
    this.rating = '3.3';
  } else if (inter >= 1.42 && inter < 1.46) {
    this.rating = '4.1';
  } else if (inter >= 1.46 && inter < 1.52) {
    this.rating = '4.2';
  } else if (inter >= 1.52 && inter < 1.575) {
    this.rating = '4.3';
  } else if (inter >= 1.575 && inter < 1.67) {
    this.rating = '5.1';
  } else if (inter >= 1.67 && inter < 1.745) {
    this.rating = '5.2';
  } else if (inter >= 1.745 && inter < 1.81) {
    this.rating = '5.3';
  } else if (inter >= 1.81 && inter < 1.95) {
    this.rating = '5.4';
  } else if (inter >= 1.95 && inter < 2.09) {
    this.rating = '5.5';
  } else if (inter >= 2.09 && inter < 2.25) {
    this.rating = '5.6';
  } else if (inter >= 2.25 && inter < 2.4) {
    this.rating = '5.7';
  } else {
    this.rating = '5.8';
  }
};


/**
 * @export
 */
app.CotometerController.prototype.cotometerTechnicalGrade = function() {
  this.errorSlope = (isNaN(this.slope) || this.slope < 0 || this.slope > 80.0);
  this.errorElevation = (isNaN(this.elevation) || this.elevation < 50.0 || this.elevation > 3000.0);

  if (this.errorSlope || this.errorElevation) {
    return false;
  }

  this.cotometerRating_();
};


/**
 * @export
 */
app.CotometerController.prototype.setResult = function() {
  this.$uibModalStack_.dismissAll();
};


/**
 * @export
 */
app.CotometerController.prototype.closeDialog = function() {
  this.$uibModalStack_.dismissAll();
};

app.module.controller('AppCotometerController', app.CotometerController);
