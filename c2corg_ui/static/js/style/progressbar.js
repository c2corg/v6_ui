goog.provide('app.ProgressBarController');
goog.provide('app.progressBarDirective');

goog.require('app');


/**
 * The progress bar on the top of editing pages.
 * The navigation buttons (right and left) are also managed
 * by this directive.
 * @return {angular.Directive} The directive specs.
 */
app.progressBarDirective = function() {
  return {
    restrict: 'E',
    controller: 'appProgressBarController as progressBarCtrl'
  };
};

app.module.directive('appProgressBar', app.progressBarDirective);


/**
 * @param {angular.$interval} $interval service
 * @constructor
 * @ngInject
 * @export
 */
app.ProgressBarController = function($interval) {

/**
 * @type  {angular.$interval} $interval service
 * @private
 */
  this.interval_ = $interval;

  /**
   * first next step would be 2 by default
   * @export
   */
  this.nextStep = 2;

  /**
   * Current step is 1 by default
   * @export
   */
  this.currentStep = 1;

  /**
   * Previous step is 0 by default
   * @export
   */
  this.previousStep = 0;

  /**
   * Max possible steps for creation/edition
   * @export
   */
  this.maxSteps;

  /**
   * Waypoint type initialised in the edit.html
   * @export
   */
  this.waypointType;

};


/**
 * Navigate through creation/editing steps
 * @param {number} step
 * @param {string} direction
 * @export
 */
app.ProgressBarController.prototype.step = function(step, document, direction) {
  var el = '.create-edit-document .editing';

  switch (step) {
    case 1:
      $(el).animate({left: '0'});
      this.animateBar_(step, direction);
      this.previousStep = 0;
      this.currentStep = 1;
      this.nextStep = 2;
      break;

    case 2:
      $(el).animate({left: '-115%'});
      this.animateBar_(step, direction);
      this.previousStep = 1;
      this.currentStep = 2;
      this.nextStep = 3;
      break;

    case 3:
      $(el).animate({left: '-229%'});
      this.animateBar_(step, direction);
      this.previousStep = 2;
      this.currentStep = 3;
      this.nextStep = 4;
      break;

    case 4:
      $(el).animate({left: '-343%'});
      this.animateBar_(step, direction);
      this.previousStep = 3;
      this.currentStep = 4;
      this.nextStep = 5;
      break;

    default:
      break;
  }
};


/**
 * Animate the progress bar
 * @param {number} step
 * @param {string} direction
 * @private
 */
app.ProgressBarController.prototype.animateBar_ = function(step, direction) {
  var percent = 100 / this.maxSteps;
  var green = '#A9D361'; // completed color
  var gray = '#B4B4B4'; // left color
  var willBe;
  var nextPosition;
  var stopBack;

  $('.nav-step-selected').removeClass('nav-step-selected');
  $('.nav-step-' + step).addClass('nav-step-selected');
  $('html, body').animate({scrollTop: 0}, 'slow');

  if (direction === 'forwards') {
    willBe = (percent * (step - 1)) - 10;
    nextPosition = (percent * step) - 10;
  } else {
    willBe = (percent * step) - 10;
    nextPosition = (percent * (step + 1)) - 10;
    stopBack = willBe;
  }

  // bar animation, interval for a gradual filling
  var interval = this.interval_(function() {
    // if the direction is forwards, animate bar to the right
    if (direction === 'forwards') {
      // animate till the end (120%)
      if (step === this.maxSteps) {
        if (willBe >= 120) {
          this.interval_.cancel(interval);
        } else {
          willBe++;
        }
        // animate to the next position ->
      } else {
        if (willBe >= nextPosition) {
          this.interval_.cancel(interval);
        } else {
          willBe++;
        }
      }
      // if the direction is backwards, animate bar to the left <-
    } else {
      if (willBe >= stopBack) {
        nextPosition--;
        willBe = nextPosition;
      } else {
        this.interval_.cancel(interval);
      }
    }

    $('.progress-bar-edit')
      .css({'background-image': '-webkit-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-o-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-moz-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': '-ms-linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'})
      .css({'background-image': 'linear-gradient(left, ' + green + ' 0,' + green + ' ' + willBe + '%,' + gray + ' ' + (willBe + 7) + '%,' + gray + ' 0%)'});
  }.bind(this), 10);
};


/**
 * Update steps, depending on the waypoint type.
 * @param {string} waypointType
 * @export
 */
app.ProgressBarController.prototype.updateMaxSteps = function(waypointType) {
  this.maxSteps = app.constants.STEPS[waypointType] || 2;
};

app.module.controller('appProgressBarController', app.ProgressBarController);
