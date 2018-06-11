/**
 * @module app.activityFilterDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} The directive specs.
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'appActivityFilterController',
    controllerAs: 'afilterCtrl',
    bindToController: {
      'activities': '<',
      'documents': '<'
    },
    templateUrl: '/static/partials/activityfilter.html'
  };
};

appBase.module.directive('appActivityFilter', exports);


export default exports;
