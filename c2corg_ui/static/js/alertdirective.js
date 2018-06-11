/**
 * @module app.alertDirective
 */
import appBase from './index.js';

/**
 * This directive is used to display one alert message.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const exports = function() {
  return {
    restrict: 'E',
    controller: 'AppAlertController',
    controllerAs: 'alertCtrl',
    bindToController: true,
    templateUrl: '/static/partials/alert.html',
    scope: {
      'type': '@',
      'close': '&',
      'timeout': '@',
      'msg': '@'
    },
    link: function() {
      $('body').click((e) => {
        if ($('.alert').length > 0 && $(e.target).closest('.alert').length === 0) {
          $('.loading').removeClass('loading');
          $('.alert').hide();
        }
      });
    }
  };
};


appBase.module.directive('appAlert', exports);


export default exports;
