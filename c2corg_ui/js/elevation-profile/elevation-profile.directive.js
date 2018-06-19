import template from './elevation-profile.html';

const ElevationProfileDirective = () => {
  return {
    restrict: 'E',
    controller: 'ElevationProfileController',
    controllerAs: 'elevationProfileCtrl',
    template
  };
};

export default ElevationProfileDirective;
