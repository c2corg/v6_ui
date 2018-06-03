goog.provide('app.announcementDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.announcementDirective = function() {
  return {
    restrict: 'E',
    controller: 'appAnnouncementController',
    controllerAs: 'announcementCtrl',
    templateUrl: '/static/partials/announcement.html'
  };
};
app.module.directive('appAnnouncement', app.announcementDirective);
