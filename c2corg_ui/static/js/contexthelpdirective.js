goog.provide('app.contextHelpDirective');

goog.require('app');

/**
 * This directive is used to display a contextual help modal dialog.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap.
 * @param {angular.$templateCache} $templateCache service.
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.contextHelpDirective = function($uibModal, $templateCache, $compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.append(' <span class="glyphicon glyphicon-info-sign context-help-sign">');
      element.on('click', () => {
        $uibModal.open({
          controller: 'AppContextHelpModalController',
          controllerAs: 'contextHelpModalCtrl',
          templateUrl: '/static/partials/contexthelpmodal.html',
          'windowClass': 'context-help-modal',
          resolve: {
            content: function() {
              const templateUrl = attrs['contextHelpContentUrl'];
              if (templateUrl) {
                const template = app.utils.getTemplate(templateUrl, $templateCache);
                const elements = $compile(template)(scope);
                return angular.element('<div></div>').append(elements).html();
              } else {
                return attrs['contextHelpContent'];
              }
            },
            title: function() {
              return attrs['contextHelpTitle'];
            }
          }
        });
      });
    }
  };
};


app.module.directive('appContextHelp', app.contextHelpDirective);
