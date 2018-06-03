goog.provide('app.loadingDirective');

goog.require('app');


/**
 * @param {angular.$http} $http
 * @return {angular.Directive} directive
 * @ngInject
 */
app.loadingDirective = function($http) {
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


app.module.directive('appLoading', app.loadingDirective);
