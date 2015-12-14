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
    bindToController: true
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
  var from = this.scope_['from'];
  var to = this.scope_['to'];
  alert('TODO: compare ' + from + ' to ' + to);
};


app.module.controller('appVersionsController', app.VersionsController);
