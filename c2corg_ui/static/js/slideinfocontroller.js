/**
 * @module app.SlideInfoController
 */
import appBase from './index.js';

/**
 * @param {app.Api} appApi Api service.
 * @param {!angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
const exports = function(appApi, $scope) {

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

appBase.module.controller('AppSlideInfoController', exports);


export default exports;
