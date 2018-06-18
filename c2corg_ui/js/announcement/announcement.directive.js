import template from './announcement.html';

/**
 * @return {angular.Directive} The directive specs.
 */
const AnnouncementDirective = () => {
  return {
    restrict: 'E',
    controller: 'AnnouncementController',
    controllerAs: 'announcementCtrl',
    template
  };
};

export default AnnouncementDirective;
