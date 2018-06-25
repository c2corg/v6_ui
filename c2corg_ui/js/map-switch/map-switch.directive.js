import template from './map-switch.html';

const MapSwitchDirective = () => {
  return {
    restrict: 'E',
    controller: 'MapSwitchController',
    controllerAs: 'MapswitchCtrl',
    template
  };
};

export default MapSwitchDirective;
