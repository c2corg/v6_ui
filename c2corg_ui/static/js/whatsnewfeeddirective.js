goog.provide('app.whatsnewFeedDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.whatsnewFeedDirective = function() {
  return {
    restrict: 'E',
    controller: 'appWhatsnewFeedController as wfeedCtrl',
    templateUrl: '/static/partials/whatsnew.html'
  };
};
app.module.directive('appWhatsnewFeed', app.whatsnewFeedDirective);
