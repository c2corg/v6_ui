goog.provide('app.SearchController');
goog.provide('app.searchDirective');

goog.require('app');
goog.require('app.utils');
goog.require('ngeo.searchDirective');


/**
 * The directive for the auto-complete search field shown in the header
 * of every page.
 *
 * @return {angular.Directive} Directive Definition Object.
 */
app.searchDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppSearchController',
    bindToController: true,
    controllerAs: 'searchCtrl',
    templateUrl: '/static/partials/search.html',
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} element Element.
         * @param {angular.Attributes} attrs Atttributes.
         */
        function(scope, element, attrs) {
          // Empty the search field on focus and blur.
          element.find('input').on('focus blur', function() {
            $(this).typeahead('val', '');
          });
        }
  };
};
app.module.directive('appSearch', app.searchDirective);



/**
 * @constructor
 * @param {angular.Scope} $rootScope Angular root scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {string} apiUrl Base URL of the API.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @ngInject
 */
app.SearchController = function($rootScope, $compile, apiUrl, gettextCatalog) {

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {TypeaheadOptions}
   * @export
   */
  this.options = /** @type {TypeaheadOptions} */ ({
    highlight: true,
    hint: true,
    minLength: 3
  });

  /**
   * @type {Array.<TypeaheadDataset>}
   * @export
   */
  this.datasets = [
    this.createDataset_('waypoints', 'Waypoints'),
    this.createDataset_('routes', 'Routes')
  ];

  /**
   * @type {ngeox.SearchDirectiveListeners}
   * @export
   */
  this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
    select: app.SearchController.select_.bind(this)
  });
};


/**
 * @param {string} type The document type.
 * @param {string} title The category title.
 * @return {TypeaheadDataset} A data set.
 * @private
 */
app.SearchController.prototype.createDataset_ = function(type, title) {
  var bloodhoundEngine = this.createAndInitBloodhound_(type);
  return /** @type {TypeaheadDataset} */({
    source: bloodhoundEngine.ttAdapter(),
    display: function(doc) {
      return doc.label;
    },
    limit: 20,
    templates: {
      header: (function() {
        return '<div class="header">' +
            this.gettextCatalog_.getString(title) + '</div>';
      }).bind(this),
      suggestion: function(doc) {
        return '<p>' + doc.label + '</p>';
      }
      // Note: The templates for `notFound` and `pending` are not set, because
      // they would be shown for each dataset.
    }
  });
};


/**
 * @param {string} type The document type.
 * @return {Bloodhound} The bloodhound engine.
 * @private
 */
app.SearchController.prototype.createAndInitBloodhound_ = function(type) {
  var url = this.apiUrl_ + '/search?q=%QUERY';
  var bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
    limit: 10,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    remote: {
      url: url,
      wildcard: '%QUERY',
      rateLimitWait: 50,
      prepare: (function(query, settings) {
        var url = settings['url'] +
            '&pl=' + this.gettextCatalog_.currentLanguage;
        settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
        return settings;
      }).bind(this),
      filter: (function(/** appx.SearchResponse */ resp) {
        var documentResponse =
            /** @type {appx.SearchDocumentResponse} */ (resp[type]);
        var documents = documentResponse.documents;
        var currentCulture = this.gettextCatalog_.currentLanguage;

        return documents.map(function(/** appx.SearchDocument */ doc) {
          var locale = doc.locales[0];
          doc.label = locale.title;

          if (currentCulture !== locale.culture) {
            doc.label += ' (' + locale.culture + ')';
          }

          doc.documentType = type;
          return doc;
        });
      }).bind(this)
    }
  }));
  bloodhound.initialize();
  return bloodhound;
};


/**
 * @param {jQuery.Event} event Event.
 * @param {appx.SearchDocument} doc Suggested document.
 * @param {TypeaheadDataset} dataset Dataset.
 * @this {app.SearchController}
 * @private
 */
app.SearchController.select_ = function(event, doc, dataset) {
  var culture = doc.locales[0].culture;
  var url = app.utils.buildDocumentUrl(
      doc.documentType, doc.document_id, culture);
  window.location.href = url;
};

app.module.controller('AppSearchController', app.SearchController);
