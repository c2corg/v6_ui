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
