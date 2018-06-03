goog.provide('app.alertDirective');

goog.require('app');


/**
 * This directive is used to display one alert message.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.alertDirective = function() {
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


app.module.directive('appAlert', app.alertDirective);
