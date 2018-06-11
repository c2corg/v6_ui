/**
 * @module app.loadingDirective
 */
import appBase from './index.js';

/**
 * @param {angular.$http} $http
 * @return {angular.Directive} directive
 * @ngInject
 */
const exports = function($http) {
  return {
    restrict: 'A',
    scope: true,
    link:
     /**
      * @param {angular.Scope} scope Scope.
      * @param {angular.JQLite} el Element.
      * @param {angular.Attributes} attrs Atttributes.
      */
     function(scope, el, attrs) {
       scope.$watch(() => {
         return $http.pendingRequests.length;
       }, () => {
         if ($http.pendingRequests.length > 0) {
           $('.loading-gif').show();
         } else {
           $('.loading-gif').hide();
         }
       });
     }
  };
};


appBase.module.directive('appLoading', exports);


export default exports;
