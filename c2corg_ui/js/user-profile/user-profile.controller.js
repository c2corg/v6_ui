import angular from 'angular';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Alerts} appAlerts
 * @constructor
 * @struct
 * @ngInject
 */
export default class UserProfileController {
  constructor($scope, $http, $compile, AlertsService) {
    'ngInject';

    /**
     * @type {number}
     * @export
     */
    this.userId;

    /**
     * @type {string}
     * @export
     */
    this.lang;

    /**
     * @type {app.Alerts}
     * @private
     */
    this.alerts_ = AlertsService;

    /**
     * An authenticated request is made to the ui server to get the profile data
     * as rendered HTML (profiles can be marked as non-public).
     */
    const url = '/profiles/data/{id}/{lang}'
      .replace('{id}', this.userId.toString())
      .replace('{lang}', this.lang);
    const promise = $http.get(url);
    promise.catch((response) => {
      this.alerts_.addErrorWithMsg(
        this.alerts_.gettext('An error occured while loading this profile'),
        response);
    });
    promise.then((response) => {
      const element = angular.element('#user-profile-data');
      element.html(response['data']);
      $compile(element.contents())($scope.$parent);
    });
  }
}
