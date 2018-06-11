/**
 * @module app.progressBarDirective
 */
import appBase from './index.js';

/**
 * The progress bar on the top of editing pages.
 * The navigation buttons (right and left) are also managed
 * by this directive.
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appProgressBarController as progressBarCtrl'
  };
};

appBase.module.directive('appProgressBar', exports);


export default exports;
