goog.provide('app.DocumentEditingController');
goog.provide('app.documentEditingDirective');

goog.require('app');



/**
 * @constructor
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.documentEditingDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appDocumentEditingController',
    controllerAs: 'editCtrl',
    bindToController: true
  };
};


app.module.directive('appDocumentEditing', app.documentEditingDirective);



/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.JQLite} $element Element.
 * @param {angular.Attributes} $attrs Attributes.
 * @param {angular.$http} $http
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @ngInject
 * @export
 */
app.DocumentEditingController = function($scope, $element, $attrs, $http,
    apiUrl) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl + (apiUrl.substr(-1) != '/' ? '/' : '');

  /**
   * @type {string}
   * @private
   */
  this.modelName_ = $attrs['appDocumentEditing'];

  if ('appDocumentEditingRoute' in $attrs) {
    var route = $attrs['appDocumentEditingRoute'];
    // Get document attributes from the API to feed the model:
    this.http_.get(this.apiUrl_ + route).then(
        goog.bind(this.successRead_, this),
        goog.bind(this.errorRead_, this)
    );
  }
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successRead_ = function(response) {
  console.log(response);
  this.scope_[this.modelName_] = response['data'];
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorRead_ = function(response) {
  // TODO: better error handling
  alert('Failed loading the document: ' +
      response.status + ' ' + response.statusText);
};


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentEditingController.prototype.submitForm = function(isValid) {
  if (!isValid) {
    // TODO: better handling?
    alert('Form is not valid');
  }
  alert('submitting form');
  // TODO push to API
};


app.module.controller('appDocumentEditingController',
    app.DocumentEditingController);
