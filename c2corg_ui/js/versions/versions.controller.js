/**
 * @param {angular.Scope} $scope Scope.
 * @constructor
 * @ngInject
 */
export default class VersionsController {
  constructor($scope) {
    'ngInject';

    /**
     * @type {angular.Scope}
     * @private
     */
    this.scope_ = $scope;
  }


  /**
   * @export
   */
  compare() {
    const url = '/{documentType}/diff/{id}/{lang}/{v1}/{v2}'
      .replace('{documentType}', this['documentType'])
      .replace('{id}', this['documentId'])
      .replace('{lang}', this['lang'])
      .replace('{v1}', this.scope_['from'])
      .replace('{v2}', this.scope_['to']);
    window.location.href = url;
  }
}
