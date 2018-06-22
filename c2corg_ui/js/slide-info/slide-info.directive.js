import angular from 'angular';
import template from './slide-info.html';

/**
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
const SlideInfoDirective = $compile => {
  'ngInject';

  return {
    restrict: 'E',
    controller: 'SlideInfoController as slideCtrl',
    bindToController: true,
    scope: true,
    template,
    link(scope, el) {
      angular.extend(scope, scope.$parent['photo']);
      $compile(el.contents())(scope);
    }
  };
};

export default SlideInfoDirective;
