goog.provide('app.DocumentController');

goog.require('app');
goog.require('ngeo.mapDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');



/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$http} $http
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @export
 * @ngInject
 */
app.DocumentController = function($scope, $http, gettextCatalog,
    langUrlTemplate, apiUrl) {

  /**
   * @protected
   */
  this.scope = $scope;

  /**
   * @protected
   */
  this.http = $http;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {string}
   * @private
   */
  this.langUrlTemplate_ = langUrlTemplate;

  /**
   * @type {string}
   * @protected
   */
  this.apiUrl = apiUrl;

  /**
   * @type {string}
   * @export
   */
  this.lang;

  /**
   * @type {string}
   * @protected
   */
  this.baseRoute = '/documents';

  /**
   * @type {string}
   * @protected
   */
  this.modelname = 'document';

  /**
   * @type {ol.Map}
   * export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 4
    })
  });

  this.switchLanguage('fr');
};


/**
 * @param {string} lang Language code.
 * @export
 */
app.DocumentController.prototype.switchLanguage = function(lang) {
  this.gettextCatalog_.setCurrentLanguage(lang);
  this.gettextCatalog_.loadRemote(
      this.langUrlTemplate_.replace('__lang__', lang));
  this.lang = lang;
};


/**
 * @return {Object}
 * @protected
 */
app.DocumentController.prototype.buildData = function() {
  // FIXME: use a property for model?
  var model = this.scope[this.modelname];
  model['locales'] = [];
  if ('locale' in model) {
    var locale = {};
    goog.object.forEach(model['locale'], function(value, key) {
      locale[key] = value;
    });
    model['locales'].push(locale);
    delete model['locale'];
  }
  return model;
};


/**
 * @param {string} route Final part of the URL.
 * @return {string} URL of REST API to query.
 * @protected
 */
app.DocumentController.prototype.buildUrl = function(route) {
  return this.apiUrl + this.baseRoute + route;
};


/**
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentController.prototype.saveEditedDocument = function(isValid) {
  if (!isValid) {
    // TODO: better handling?
    alert('Form is not valid');
  }
  // push to API
  // FIXME: PUT if update
  this.http.post(this.buildUrl(''), this.buildData(), {
    headers: { 'Content-Type': 'application/json' }
  }).then(
      function successCallback(response) {
        console.log(response);
      },
      function errorCallback(response) {
        console.log(response);
      }
  );
};


/**
 * @param {number} id Document id.
 * @param {string} culture Document culture.
 * @export
 */
app.DocumentController.prototype.feedModel = function(id, culture) {
  // FIXME
};


app.module.controller('DocumentController', app.DocumentController);
