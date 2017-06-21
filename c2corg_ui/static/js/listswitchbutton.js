goog.provide('app.ListSwitchButtonController');
goog.provide('app.listSwitchButtonDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.listSwitchButtonDirective = function() {
  return {
    restrict: 'E',
    controller: 'appListSwitchButtonController',
    controllerAs: 'switchButtonCtrl',
    templateUrl: '/static/partials/listswitchbutton.html'
  };
};
app.module.directive('appListSwitchButton', app.listSwitchButtonDirective);


/**
 * @param {app.ListSwitch} appListSwitch service
 * @constructor
 * @ngInject
 */
app.ListSwitchButtonController = function(appListSwitch) {

  /**
   * @type {app.ListSwitch}
   */
  this.listSwitchService = appListSwitch;

  /**
   * @type {boolean}
   * @export
   */
  this.showList = this.listSwitchService.isList();
};


/**
 * @export
 */
app.ListSwitchButtonController.prototype.toggle = function() {
  this.showList = this.listSwitchService.toggle();
};

app.module.controller('appListSwitchButtonController', app.ListSwitchButtonController);
