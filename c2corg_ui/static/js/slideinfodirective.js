/**
 * @module app.slideInfoDirective
 */
import appBase from './index.js';

/**
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
const exports = function($compile) {
  return {
    restrict: 'E',
    controller: 'AppSlideInfoController as slideCtrl',
    bindToController: true,
    scope: true,
    templateUrl: '/static/partials/slideinfo.html',
    link: function(scope, el) {
      angular.extend(scope, scope.$parent['photo']);
      $compile(el.contents())(scope);
    }
  };
};

appBase.module.directive('appSlideInfo', exports);


export default exports;
