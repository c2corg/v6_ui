import angular from 'angular';
import template from './context-help-modal.html';

/**
 * This directive is used to display a contextual help modal dialog.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap.
 * @param {angular.$templateCache} $templateCache service.
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const ContextHelpDirective = ($uibModal, $templateCache, $compile, UtilsService) => {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      element.append('<span class="glyphicon glyphicon-info-sign context-help-sign">');
      element.on('click', () => {
        $uibModal.open({
          controller: 'ContextHelpModalController',
          controllerAs: 'contextHelpModalCtrl',
          template,
          'windowClass': 'context-help-modal',
          resolve: {
            content() {
              const templateUrl = attrs['contextHelpContentUrl'];
              if (templateUrl) {
                const template = UtilsService.getTemplate(templateUrl, $templateCache);
                const elements = $compile(template)(scope);
                return angular.element('<div></div>').append(elements).html();
              } else {
                return attrs['contextHelpContent'];
              }
            },
            title() {
              return attrs['contextHelpTitle'];
            }
          }
        });
      });
    }
  };
};

export default ContextHelpDirective;
