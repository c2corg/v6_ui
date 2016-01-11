goog.provide('app.VersionsController');
goog.provide('app.versionsDirective');

goog.require('app');


/**
 * This directive is used to manage the history form.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.versionsDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appVersionsController',
    controllerAs: 'versionsCtrl',
    bindToController: {
      'documentType': '@',
      'documentId': '@',
      'lang': '@'
    }
  };
};


app.module.directive('appVersions', app.versionsDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @export
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
  var url = '/{documentType}/diff/{id}/{lang}/{v1}/{v2}'
    .replace('{documentType}', this['documentType'])
    .replace('{id}', this['documentId'])
    .replace('{lang}', this['lang'])
    .replace('{v1}', this.scope_['from'])
    .replace('{v2}', this.scope_['to']);
  window.location.href = url;
};


app.module.controller('appVersionsController', app.VersionsController);
