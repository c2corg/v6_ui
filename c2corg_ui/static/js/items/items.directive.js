import template from './items.html';

const ItemsDirective = () => {
  return {
    scope: {},
    restrict: 'E',
    controller: 'ItemsController as ctrl',
    template
  };
};

export default ItemsDirective;
