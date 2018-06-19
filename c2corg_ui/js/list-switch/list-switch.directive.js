import template from './list-switch.html';

const ListSwitchDirective = () => {
  return {
    restrict: 'E',
    controller: 'ListSwitchController',
    controllerAs: 'switchCtrl',
    link(scope, element, attrs) {
      scope.type = attrs.type;
    },
    template
  };
};

export default ListSwitchDirective;
