goog.provide('app.ListSwitchActionController');
goog.provide('app.listSwitchActionDirective');

goog.require('app');


/**
 * @return {angular.Directive} The directive specs.
 */
app.listSwitchActionDirective = function() {
  return {
    restrict: 'E',
    controller: 'appListSwitchActionController',
    controllerAs: 'switchActionCtrl',
    templateUrl: '/static/partials/listswitchaction.html'
  };
};
app.module.directive('appListSwitchAction', app.listSwitchActionDirective);


/**
 * @param {app.ListSwitch} appListSwitch service
 * @constructor
 * @ngInject
 */
app.ListSwitchActionController = function(appListSwitch) {

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
app.ListSwitchActionController.prototype.toggle = function() {
  this.showList = this.listSwitchService.toggle();
};

app.module.controller('appListSwitchActionController', app.ListSwitchActionController);
