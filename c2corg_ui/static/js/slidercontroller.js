/**
 * @module app.SliderController
 */
import appBase from './index.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @struct
 * @ngInject
 */
const exports = function($scope, $element, $attrs, ngeoLocation) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.JQLite}
   * @private
   */
  this.element_ = $element;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {?Array.<string>}
   * @export
   */
  this.valuesList;

  /**
   * @type {boolean}
   * @private
   */
  this.showStringValues_ = this.valuesList !== undefined &&
    this.valuesList.length > 0;

  /**
   * @type {Array.<number>}
   * @public
   */
  this.boundaries;

  /**
   * @type {number}
   * @public
   */
  this.step;

  if (this.showStringValues_) {
    this.boundaries = [0, this.valuesList.length - 1];
    this.step = 1;
  } else {
    this.boundaries = [
      parseInt($attrs['min'], 10) || exports.MIN,
      parseInt($attrs['max'], 10) || exports.MAX
    ];
    this.step = parseInt($attrs['step'], 10) || exports.STEP;
  }

  /**
   * @type {number}
   * @public
   */
  this.min = this.boundaries[0];

  /**
   * @type {number}
   * @public
   */
  this.max = this.boundaries[1];

  /**
   * @type {string}
   * @export
   */
  this.unit = 'unit' in $attrs ? $attrs['unit'] : exports.UNIT;

  /**
   * @type {string}
   * @export
   */
  this.filter;

  /**
   * @type {Object}
   * @export
   */
  this.filtersList;

  /**
   * @type {boolean}
   * @private
   */
  this.sliderFirst_ = true;

  /**
   * @type {number|string}
   * @export
   */
  this.dispMin = this.getDisp_(this.min);

  /**
   * @type {number|string}
   * @export
   */
  this.dispMax = this.getDisp_(this.max);

  this.getRangeFromUrl_();

  this.element_.on('slide', (event) => {
    this.updateMinMax_(event.value);
    this.scope_.$apply();
  });

  this.element_.on('slideStop', this.handleRangeChange_.bind(this));

  this.scope_.$root.$on('searchFilterClear', this.handleClear_.bind(this));
};


/**
 * @private
 */
exports.prototype.getRangeFromUrl_ = function() {
  const param = this.filter ? this.location_.getFragmentParam(this.filter) : '';
  if (param) {
    let range = param.split(',');
    if (range.length != 2) {
      return;
    }
    if (this.showStringValues_) {
      const min = this.valuesList.indexOf(range[0]);
      const max = this.valuesList.indexOf(range[1]);
      if (min !== -1 && max !== -1) {
        this.updateMinMax_([min, max]);
      }
    } else {
      range = range.map((x) => {
        return parseInt(x, 10);
      });
      this.updateMinMax_(range);
    }
  }
};


/**
 * @private
 */
exports.prototype.handleRangeChange_ = function() {
  if (!this.filter) {
    return;
  }
  if (this.sliderFirst_) {
    if (this.min === this.boundaries[0] && this.max === this.boundaries[1]) {
      // Remove filter if the min/max values are the boundaries.
      delete this.filtersList[this.filter];
      this.location_.deleteFragmentParam(this.filter);
    } else {
      this.filtersList[this.filter] = [this.dispMin, this.dispMax];
    }
    this.scope_.$apply();
  }
  // Because the slider has 2 handles, the slideStop event occurs twice:
  // we take into account only one out of two calls.
  this.sliderFirst_ = !this.sliderFirst_;
};


/**
 * @private
 */
exports.prototype.handleClear_ = function() {
  this.updateMinMax_(this.boundaries);
  $(this.element_).find('.range-between').slider('setValue', this.boundaries);
};


/**
 * @param {Array.<number>} values Array of min/max values.
 * @private
 */
exports.prototype.updateMinMax_ = function(values) {
  this.min = values[0];
  this.max = values[1];
  this.dispMin = this.getDisp_(this.min);
  this.dispMax = this.getDisp_(this.max);
};


/**
 * @param {number} value Slider value.
 * @return {number|string}
 * @private
 */
exports.prototype.getDisp_ = function(value) {
  return this.showStringValues_ ? this.valuesList[value] : value;
};


/**
 * @const
 * @type {number}
 */
exports.MIN = 0;


/**
 * @const
 * @type {number}
 */
exports.MAX = 9999;


/**
 * @const
 * @type {number}
 */
exports.STEP = 100;


/**
 * @const
 * @type {string}
 */
exports.UNIT = 'm';


appBase.module.controller('AppSliderController', exports);


export default exports;
