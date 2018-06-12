import template from './lang.html';

const LangDirective = () => {
  return {
    restrict: 'E',
    controller: 'LangController',
    controllerAs: 'langCtrl',
    bindToController: true,
    template
  };
};

export default LangDirective;
