goog.provide('app.slideInfoDirective');
goog.provide('app.SlideInfoController');
goog.require('app');


/**
 * @return {angular.Directive} Directive Definition Object.
 */
app.slideInfoDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppSlideInfoController as slideCtrl',
    bindToController: true,
    scope: true,
    templateUrl: '/static/partials/slideinfo.html',
    link: function(scope, el) {
      angular.extend(scope, scope.$parent['photo']);
    }
  };
};


app.module.directive('appSlideInfo', app.slideInfoDirective);


/**
 * @param {app.Api} appApi Api service.
 * @param {!angular.Scope} $scope Scope.
 * @constructor
 * @export
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

  /**
   * @type {boolean}
   * @export
   */
  this.editing = false;
};


/**
 * @export
 */
app.SlideInfoController.prototype.edit = function() {
  this.editing = true;
};


/**
 * @export
 */
app.SlideInfoController.prototype.save = function() {
  this.editing = false;
};


/**
 * @export
 */
app.SlideInfoController.prototype.cancel = function() {
  this.editing = false;
};


app.module.controller('AppSlideInfoController', app.SlideInfoController);
