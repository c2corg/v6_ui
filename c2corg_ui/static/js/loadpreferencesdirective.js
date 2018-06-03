goog.provide('app.loadPreferencesDirective');

goog.require('app');


/**
 * @return {angular.Directive}
 */
app.loadPreferencesDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppLoadPreferencesController',
    controllerAs: 'lpCtrl',
    bindToController: {
      'module': '@appLoadPreferences',
      'url': '@appLoadPreferencesUrl'
    },
    link: function(scope, el, attr, ctrl) {
      el.click(() => {
        ctrl.applyPreferences();
      });
    }
  };
};

app.module.directive('appLoadPreferences', app.loadPreferencesDirective);
