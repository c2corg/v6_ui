goog.provide('app.XreportController');
goog.provide('app.xreportDirective');

goog.require('app');


/**
 * Directive managing the xreport.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.xreportDirective = function() {
  return {
    restrict: 'A',
    scope: {
      'xreportId': '@appXreport',
      'lang': '@appXreportLang'
    },
    controller: 'appXreportController',
    controllerAs: 'xrCtrl',
    bindToController: true
  };
};


app.module.directive('appXreport', app.xreportDirective);

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Alerts} appAlerts
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.XreportController = function($scope, $http, $compile, appAlerts) {

  /**
   * @type {number}
   * @export
   */
  this.xreportId;

  /**
   * @type {string}
   * @export
   */
  this.lang;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * An authenticated request is made to the UI server to get the xreport
   * private data as rendered HTML (data are available to creator/moderator).
   */
  var url = '/xreports/data/{id}/{lang}'
    .replace('{id}', this.xreportId.toString())
    .replace('{lang}', this.lang);
  var promise = $http.get(url);
  promise.catch(function(response) {
    this.alerts_.addErrorWithMsg(
      this.alerts_.gettext('An error occured while loading this xreport private data'),
      response);
  }.bind(this));
  promise.then(function(response) {
    var element = angular.element('#xreport-data');
    element.html(response['data']);
    $compile(element.contents())($scope.$parent);
  }.bind(this));
};


app.module.controller('appXreportController', app.XreportController);
