goog.provide('app.SliderController');
goog.provide('app.sliderDirective');

goog.require('app');
goog.require('ngeo.Location');


/**
 * This directive displays a slider control used for instance in the advanced
 * search filters form.
 *
 * @return {angular.Directive} The directive specs.
 */
app.sliderDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppSliderController',
    controllerAs: 'sliderCtrl',
    bindToController: true,
    scope: {
      'filter': '@',
      'filtersList': '=',
      'valuesList': '='
    },
    template:
        '<input type="range" class="range-between" data-slider-tooltip="hide">' +
        '<span class="slider-min-max">' +
          '<p class="min-value">{{sliderCtrl.dispMin | translate}} {{sliderCtrl.unit | translate}}</p>' +
          '<p class="max-value">{{sliderCtrl.dispMax | translate}} {{sliderCtrl.unit | translate}}</p>' +
        '</span>',
    link: function(scope, el, attr, ctrl) {
      el.find('.range-between').slider({
        min: ctrl.boundaries[0],
        max: ctrl.boundaries[1],
        value: [ctrl.min, ctrl.max],
        step: ctrl.step
      });
    }
  };
};

app.module.directive('appSlider', app.sliderDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @constructor
 * @struct
 * @ngInject
 */
app.SliderController = function($scope, $element, $attrs, ngeoLocation) {

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
      parseInt($attrs['min'], 10) || app.SliderController.MIN,
      parseInt($attrs['max'], 10) || app.SliderController.MAX
    ];
    this.step = parseInt($attrs['step'], 10) || app.SliderController.STEP;
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
  this.unit = 'unit' in $attrs ? $attrs['unit'] : app.SliderController.UNIT;

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
app.SliderController.prototype.getRangeFromUrl_ = function() {
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
app.SliderController.prototype.handleRangeChange_ = function() {
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
app.SliderController.prototype.handleClear_ = function() {
  this.updateMinMax_(this.boundaries);
  $(this.element_).find('.range-between').slider('setValue', this.boundaries);
};


/**
 * @param {Array.<number>} values Array of min/max values.
 * @private
 */
app.SliderController.prototype.updateMinMax_ = function(values) {
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
app.SliderController.prototype.getDisp_ = function(value) {
  return this.showStringValues_ ? this.valuesList[value] : value;
};


/**
 * @const
 * @type {number}
 */
app.SliderController.MIN = 0;


/**
 * @const
 * @type {number}
 */
app.SliderController.MAX = 9999;


/**
 * @const
 * @type {number}
 */
app.SliderController.STEP = 100;


/**
 * @const
 * @type {string}
 */
app.SliderController.UNIT = 'm';


app.module.controller('AppSliderController', app.SliderController);
