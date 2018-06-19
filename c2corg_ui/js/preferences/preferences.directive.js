/**
 * Directive managing the user preferences.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const PreferencesDirective = () => {
  return {
    restrict: 'A',
    controller: 'PreferencesController',
    controllerAs: 'prefCtrl'
  };
};

export default PreferencesDirective;
