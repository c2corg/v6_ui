goog.provide('app.slideInfoDirective');
goog.provide('app.SlideInfoController');
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


/**
 * @param {app.Api} appApi Api service.
 * @param {!angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
app.SlideInfoController = function(appApi, $scope) {

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;
};

app.module.controller('AppSlideInfoController', app.SlideInfoController);
