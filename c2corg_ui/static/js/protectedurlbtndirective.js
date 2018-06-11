/**
 * @module app.protectedUrlBtnDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} directive for detailed views
 */
const exports = function() {
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

appBase.module.directive('protectedUrlBtn', exports);


export default exports;
