const LoadPreferencesDirective = () => {
  return {
    restrict: 'A',
    controller: 'LoadPreferencesController',
    controllerAs: 'lpCtrl',
    bindToController: {
      'module': '@c2cLoadPreferences',
      'url': '@c2cLoadPreferencesUrl'
    },
    link(scope, el, attr, ctrl) {
      el.click(() => {
        ctrl.applyPreferences();
      });
    }
  };
};

export default LoadPreferencesDirective;
