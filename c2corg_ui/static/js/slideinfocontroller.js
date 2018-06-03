goog.provide('app.SlideInfoController');

goog.require('app');


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
