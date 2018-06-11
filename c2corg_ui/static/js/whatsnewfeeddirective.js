/**
 * @module app.whatsnewFeedDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appWhatsnewFeedController as wfeedCtrl',
    templateUrl: '/static/partials/whatsnew.html'
  };
};

appBase.module.directive('appWhatsnewFeed', exports);


export default exports;
