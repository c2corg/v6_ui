/**
 * @module app.announcementDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appAnnouncementController',
    controllerAs: 'announcementCtrl',
    templateUrl: '/static/partials/announcement.html'
  };
};

appBase.module.directive('appAnnouncement', exports);


export default exports;
