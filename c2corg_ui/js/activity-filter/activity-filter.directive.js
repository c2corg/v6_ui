import template from './activity-filter.html';

const ActivityFilterDirective = () => {
  return {
    restrict: 'E',
    controller: 'ActivityFilterController',
    controllerAs: 'afilterCtrl',
    bindToController: {
      'activities': '<',
      'documents': '<'
    },
    template
  };
};

export default ActivityFilterDirective;
