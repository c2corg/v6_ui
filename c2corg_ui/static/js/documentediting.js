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
  this.apiUrl_ = apiUrl;

  /**
   * @type {string}
   * @private
   */
  this.module_ = $attrs['appDocumentEditing'];
  goog.asserts.assert(goog.isDef(this.module_));

  /**
   * @type {string}
   * @private
   */
  this.modelName_ = $attrs['appDocumentEditingModel'];

  /**
   * @type {?number}
   * @private
   */
  this.id_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.culture_ = null;

  if ('appDocumentEditingId' in $attrs &&
      'appDocumentEditingCulture' in $attrs) {
    this.id_ = $attrs['appDocumentEditingId'];
    this.culture_ = $attrs['appDocumentEditingCulture'];
    // Get document attributes from the API to feed the model:
    this.http_.get(this.buildUrl_('read')).then(
        goog.bind(this.successRead_, this),
        goog.bind(this.errorRead_, this)
    );
  }
};


/**
 * @param {string} type Type of URL.
 * @return {string} URL.
 * @private
 */
app.DocumentEditingController.prototype.buildUrl_ = function(type) {
  var url = this.apiUrl_;
  url += url.substr(-1) != '/' ? '/' : '';
  url += this.module_;
  switch (type) {
    case 'read':
      url += '/' + this.id_ + '?l=' + this.culture_;
      break;
    case 'update':
      url += '/' + this.id_;
  }
  return url;
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successRead_ = function(response) {
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

  // push to API
  var data = this.scope_[this.modelName_];
  if (!goog.isArray(data['locales'])) {
    // FIXME
    // With ng-model="route.locales[0].description" route.locales is taken
    // as an object instead of an array.
    var locale = data['locales']['0'];
    delete data['locales'];
    data['locales'] = [locale];
  }
  console.log(data);
  var config = {
    headers: { 'Content-Type': 'application/json' }
  };
  if (this.id_) {
    // updating an existing document
    this.http_.put(this.buildUrl_('update'), data, config).then(
        goog.bind(this.successSave_, this),
        goog.bind(this.errorSave_, this)
    );
  } else {
    // creating a new document
    this.culture_ = data['locales'][0]['culture'];
    this.http_.post(this.buildUrl_('create'), data, config).then(
        goog.bind(this.successSave_, this),
        goog.bind(this.errorSave_, this)
    );
  }
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.successSave_ = function(response) {
  console.log('success save');
  console.log(response);
  // redirects to the document view page
  var url = '/' + this.module_;
  url += '/' + response['data']['document_id'];
  url += '/' + this.culture_;
  window.location.href = url;
  // FIXME: use formating function?
  // FIXME: use $window.location.href?
};


/**
 * @param {Object} response Response from the API server.
 * @private
 */
app.DocumentEditingController.prototype.errorSave_ = function(response) {
  // TODO
  alert('failed saving document');
  console.log('error save');
  console.log(response);
};


app.module.controller('appDocumentEditingController',
    app.DocumentEditingController);
