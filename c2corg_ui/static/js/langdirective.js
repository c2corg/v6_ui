goog.provide('app.langDirective');

goog.require('app');

/**
 * This directive is used to display a lang selector dropdown.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.langDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppLangController',
    controllerAs: 'langCtrl',
    bindToController: true,
    template:
        '<div class="dropdown">' +
        '  <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">' +
        '    <span class="selected-lang">{{langCtrl.lang}}</span>' +
        '    <span class="glyphicon glyphicon-option-vertical"></span>' +
        '  </button>' +
        '  <ul class="dropdown-menu dropdown-menu-right">' +
        '    <li ng-repeat="lang in langCtrl.langs" ng-click="langCtrl.updateLang(lang)"><a>{{lang | translate}}</a></li>' +
        '  </ul>' +
        '</div>'
  };
};

app.module.directive('appLang', app.langDirective);
