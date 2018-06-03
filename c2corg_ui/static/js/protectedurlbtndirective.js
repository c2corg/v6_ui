goog.provide('app.protectedUrlBtnDirective');

goog.require('app');


/**
 * @return {angular.Directive} directive for detailed views
 */
app.protectedUrlBtnDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppProtectedUrlBtnController',
    scope: {
      'url': '@'
    },
    link: function(scope, el, attr, ctrl) {
      el.click(() => {
        ctrl.redirectToProtectedUrl(scope.url);
      });
    }
  };
};

app.module.directive('protectedUrlBtn', app.protectedUrlBtnDirective);
