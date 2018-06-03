goog.provide('app.feedDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.feedDirective = function() {
  return {
    restrict: 'E',
    controller: 'appFeedController',
    controllerAs: 'feedCtrl',
    bindToController: {
      'userId': '=appFeedProfile'
    },
    templateUrl: '/static/partials/feed.html'
  };
};
app.module.directive('appFeed', app.feedDirective);
