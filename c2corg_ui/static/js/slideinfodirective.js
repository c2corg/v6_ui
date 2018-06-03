goog.provide('app.slideInfoDirective');

goog.require('app');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
app.slideInfoDirective = function($compile) {
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

app.module.directive('appSlideInfo', app.slideInfoDirective);
