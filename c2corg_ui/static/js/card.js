goog.provide('app.CardController');
goog.provide('app.cardDirective');

goog.require('app');
goog.require('app.utils');


/**
 * This directive is used to display a document card.
 *
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cardDirective = function($compile, $templateCache) {
  var template = function(doctype) {
    return $templateCache.get('/static/partials/cards/' + doctype + '.html');
  };

  return {
    restrict: 'E',
    controller: 'AppCardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '=appCardDoc'
    },
    link: function(scope, element, attrs, ctrl) {
      element.html(template(ctrl.type));
      $compile(element.contents())(scope);
    }
  };
};


app.module.directive('appCard', app.cardDirective);


/**
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @constructor
 * @struct
 * @export
 * @ngInject
 */
app.CardController = function(gettextCatalog) {

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {string}
   * @export
   */
  this.lang = gettextCatalog.currentLanguage;

  /**
   * @type {Object}
   * @export
   */
  this.doc;

  /**
   * @type {string}
   * @public
   */
  this.type = app.utils.getDoctype(this.doc['type']);

  /**
   * @type {Object}
   * @export
   */
  this.locale = this.doc.locales[0];
  for (var i = 0, n = this.doc.locales.length; i < n; i++) {
    var l = this.doc.locales[i];
    if (l['lang'] === this.lang) {
      this.locale = l;
      break;
    }
  }
};


/**
 * @param {string} str String to translate.
 * @return {string} Translated string.
 * @export
 */
app.CardController.prototype.translate = function(str) {
  return this.gettextCatalog_.getString(str);
};


/**
 * @export
 * @return {string | undefined}
 */
app.CardController.prototype.createURL = function() {
  if (window.location.pathname.indexOf('edit') === -1) {
    return app.utils.buildDocumentUrl(this.type, this.doc['document_id'],
      this.doc['locales'][0]['lang']);
  }
};


app.module.controller('AppCardController', app.CardController);
