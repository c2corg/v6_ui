import template from './alert.html';

/**
 * This directive is used to display one alert message.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const AlertDirective = () => {
  return {
    restrict: 'E',
    controller: 'AlertController',
    controllerAs: 'alertCtrl',
    bindToController: true,
    template,
    scope: {
      'type': '@',
      'close': '&',
      'timeout': '@',
      'msg': '@'
    },
    link() {
      $('body').click((e) => {
        if ($('.alert').length > 0 && $(e.target).closest('.alert').length === 0) {
          $('.loading').removeClass('loading');
          $('.alert').hide();
        }
      });
    }
  };
};

export default AlertDirective;
