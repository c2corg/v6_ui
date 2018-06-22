/**
 * @param {app.Api} ApiService Api service.
 * @param {!angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
export default class SlideInfoController {
  constructor(ApiService, $scope) {
    'ngInject';

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {!angular.Scope}
     * @private
     */
    this.scope_ = $scope;
  }
}
