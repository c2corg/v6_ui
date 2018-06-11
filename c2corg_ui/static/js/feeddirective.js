/**
 * @module app.feedDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
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

appBase.module.directive('appFeed', exports);


export default exports;
