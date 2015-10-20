goog.provide('app.DocumentController');

goog.require('app');
goog.require('ngeo.mapDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');



/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string} langUrlTemplate Language URL template.
 * @param {string} apiUrl Base URL of the API.
 * @constructor
 * @export
 * @ngInject
 */
app.DocumentController = function(gettextCatalog, langUrlTemplate, apiUrl) {

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
 * @param {boolean} isValid True if form is valid.
 * @export
 */
app.DocumentController.prototype.saveEditedDocument = function(isValid) {
  // FIXME
  alert('doc save data to ' + this.apiUrl);
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
