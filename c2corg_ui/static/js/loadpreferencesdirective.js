/**
 * @module app.loadPreferencesDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive}
 */
const exports = function() {
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

appBase.module.directive('appLoadPreferences', exports);


export default exports;
