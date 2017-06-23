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
    link: function(scope, element, attrs) {
      scope.type = attrs.type;
    },
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
  this.showList = /** @type {boolean} */ (JSON.parse(
    window.localStorage.getItem('showList') || 'false'));
};


/**
 * @export
 */
app.ListSwitchController.prototype.toggle = function() {
  this.showList = !this.showList;
  window.localStorage.setItem('showList', JSON.stringify(this.showList));
};

app.module.controller('appListSwitchController', app.ListSwitchController);
