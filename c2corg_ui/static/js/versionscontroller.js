goog.provide('app.VersionsController');

goog.require('app');


/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
app.VersionsController = function($scope) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;
};


/**
 * @export
 */
app.VersionsController.prototype.compare = function() {
  const url = '/{documentType}/diff/{id}/{lang}/{v1}/{v2}'
    .replace('{documentType}', this['documentType'])
    .replace('{id}', this['documentId'])
    .replace('{lang}', this['lang'])
    .replace('{v1}', this.scope_['from'])
    .replace('{v2}', this.scope_['to']);
  window.location.href = url;
};


app.module.controller('appVersionsController', app.VersionsController);
