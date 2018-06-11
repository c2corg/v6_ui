/**
 * @module app.VersionsController
 */
import appBase from './index.js';

/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
const exports = function($scope) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;
};


/**
 * @export
 */
exports.prototype.compare = function() {
  const url = '/{documentType}/diff/{id}/{lang}/{v1}/{v2}'
    .replace('{documentType}', this['documentType'])
    .replace('{id}', this['documentId'])
    .replace('{lang}', this['lang'])
    .replace('{v1}', this.scope_['from'])
    .replace('{v2}', this.scope_['to']);
  window.location.href = url;
};


appBase.module.controller('appVersionsController', exports);


export default exports;
