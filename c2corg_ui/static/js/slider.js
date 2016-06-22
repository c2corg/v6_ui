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
    scope: true,
    template:
        '<input type="range" class="range-between" data-slider-tooltip="hide">' +
        '<span class="slider-min-max">' +
          '<p class="min-value">{{sliderCtrl.min}} <span x-translate>{{sliderCtrl.unit}}</span></p>' +
          '<p class="max-value">{{sliderCtrl.max}} <span x-translate>{{sliderCtrl.unit}}</span></p>' +
        '</span>',
    link: function(scope, el, attr, ctrl) {
      el.find('.range-between').slider({
        min: ctrl.boundaries[0],
        max: ctrl.boundaries[1],
        value: [ctrl.min, ctrl.max],
        step: parseInt(attr['step'], 10) || app.SliderController.STEP
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
 * @export
 * @ngInject
 */
app.SliderController = function($scope, $element, $attrs, ngeoLocation) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.location_ = ngeoLocation;

  /**
   * @type {Array.<number>}
   * @const
   */
  this.boundaries = [
    parseInt($attrs['min'], 10) || app.SliderController.MIN,
    parseInt($attrs['max'], 10) || app.SliderController.MAX
  ];

  /**
   * @type {number}
   * @export
   */
  this.min = this.boundaries[0];

  /**
   * @type {number}
   * @export
   */
  this.max = this.boundaries[1];

  /**
   * @type {string}
   * @export
   */
  this.unit = 'unit' in $attrs ? $attrs['unit'] : app.SliderController.UNIT;

  /**
   * @type {string}
   * @private
   */
  this.filter_ = $attrs['filter'];

  /**
   * @type {boolean}
   * @private
   */
  this.sliderFirst_ = true;

  this.getRangeFromUrl_();

  $element.on('slide', function(event) {
    this.min = event.value[0];
    this.max = event.value[1];
    this.scope_.$apply();
  }.bind(this));

  $element.on('slideStop', this.handleRangeChange_.bind(this));
};


/**
 * @private
 */
app.SliderController.prototype.getRangeFromUrl_ = function() {
  var param = this.filter_ ? this.location_.getParam(this.filter_) : '';
  if (param) {
    var range = param.split(',');
    if (range.length != 2) {
      return;
    }
    range = range.map(function(x) {
      return parseInt(x, 10);
    });
    this.min = range[0];
    this.max = range[1];
  }
};


/**
 * @private
 */
app.SliderController.prototype.handleRangeChange_ = function() {
  if (!this.filter_) {
    return;
  }
  if (this.sliderFirst_) {
    if (this.min === this.boundaries[0] && this.max === this.boundaries[1]) {
      // Remove the permalink parameter if the min/max values are the boundaries.
      this.location_.deleteParam(this.filter_);
    } else {
      var params = {};
      params[this.filter_] = [this.min, this.max].join(',');
      this.location_.updateParams(params);
    }
    this.location_.deleteParam('offset');
    this.scope_.$root.$emit('searchFilterChange');
  }
  // Because the slider has 2 handles, the slideStop event occurs twice:
  // we take into account only one out of two calls.
  this.sliderFirst_ = !this.sliderFirst_;
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
