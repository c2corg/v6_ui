/**
 * @module app.authDirective
 */
import appBase from './index.js';

/**
 * This directive is used to manage the login/register forms.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appAuthController',
    controllerAs: 'authCtrl',
    bindToController: true
  };
};

appBase.module.directive('appAuth', exports);


export default exports;
