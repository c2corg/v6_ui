/**
 * @module app.XreportController
 */
import appBase from './index.js';

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
const exports = function($scope, $http, $compile, appAlerts) {

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
  const url = '/xreports/data/{id}/{lang}'
    .replace('{id}', this.xreportId.toString())
    .replace('{lang}', this.lang);
  const promise = $http.get(url);
  promise.catch((response) => {
    this.alerts_.addErrorWithMsg(
      this.alerts_.gettext('An error occured while loading this xreport private data'),
      response);
  });
  promise.then((response) => {
    const element = angular.element('#xreport-data');
    element.html(response['data']);
    $compile(element.contents())($scope.$parent);
  });
};


appBase.module.controller('appXreportController', exports);


export default exports;
