const ProtectedUrlBtnDirective = () => {
  return {
    restrict: 'A',
    controller: 'ProtectedUrlBtnController',
    scope: {
      'url': '@'
    },
    link(scope, el, attr, ctrl) {
      el.click(() => {
        ctrl.redirectToProtectedUrl(scope.url);
      });
    }
  };
};

export default ProtectedUrlBtnDirective;
