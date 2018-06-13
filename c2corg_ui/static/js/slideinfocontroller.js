/**
 * @module app.SlideInfoController
 */
import appBase from './index.js';

/**
 * @param {app.Api} ApiService Api service.
 * @param {!angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
const exports = function(ApiService, $scope) {

  /**
   * @type {app.Api}
   * @private
   */
  this.apiService_ = ApiService;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;
};

appBase.module.controller('AppSlideInfoController', exports);


export default exports;
