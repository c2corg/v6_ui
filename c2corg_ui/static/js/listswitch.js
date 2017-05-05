goog.provide('app.ListSwitchController');
goog.provide('app.listSwitchDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.listSwitchDirective = function() {
  return {
    restrict: 'E',
    controller: 'appListSwitchController',
    controllerAs: 'switchCtrl',
    templateUrl: '/static/partials/listswitch.html'
  };
};
app.module.directive('appListSwitch', app.listSwitchDirective);


/**
 * @constructor
 * @ngInject
 */
app.ListSwitchController = function() {

  /**
   * @type {boolean}
   * @export
   */
  this.showList = false;
};


/**
 * @export
 */
app.ListSwitchController.prototype.toggle = function() {
  this.showList = !this.showList;
};

app.module.controller('appListSwitchController', app.ListSwitchController);
