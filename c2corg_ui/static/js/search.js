goog.provide('app.SearchController');
goog.provide('app.searchDirective');

goog.require('app');
goog.require('app.utils');
/** @suppress {extraRequire} */
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
    bindToController: {
      selectHandler: '&appSelect'
    },
    controllerAs: 'searchCtrl',
    templateUrl: '/static/partials/search.html',
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} $('.page-header') Element.
         */
        function(scope, element) {
          var phoneScreen = app.constants.SCREEN.SMARTPHONE;

          // Empty the search field on focus and blur.
          $('.page-header').find('input').on('focus blur', function() {
            $(this).typeahead('val', '');
          });
          //Remove the class 'show-search' when screen width > @phone (defined in LESS)
          $(window).resize(function resize() {
            if ($(window).width() < phoneScreen) {
              $('.page-header').removeClass('show-search');
            }
          });

          // Trigger focus on search-icon click for .search
          $('.page-header .search-icon').on('click', function(event) {
            if (window.innerWidth < phoneScreen) {
              $('.page-header').find('.search').toggleClass('show-search');
              $('.page-header').find('.search').focus();
              event.stopPropagation();
            }
          });

          $('body:not(app-search)').click(function() {
            $('.tt-dataset.empty').remove();
          });

          //show spinning gif while waiting for the results
          element.on('typeahead:asyncrequest', function() {
            element.find('input').addClass('loading-gif-typehead');
          })
          element.on('typeahead:asynccancel typeahead:asyncreceive', function() {
            element.find('input').removeClass('loading-gif-typehead');
          });
        }
  };
};

app.module.directive('appSearch', app.searchDirective);


/**
 * @constructor
 * @param {angular.Scope} $scope Angular scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.Attributes} $attrs Angular attributes.
 * @param {string} apiUrl Base URL of the API.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @ngInject
 */
app.SearchController = function($scope, $compile, $attrs, apiUrl, gettextCatalog) {

  /**
   * Bound from directive.
   * @type {function({doc: appx.SearchDocument})|undefined}
   * @export
   */
  this.selectHandler;

  /**
   * @type {angular.$compile}
   * @private
   */
  this.compile_ = $compile;

  if (!$attrs['appSelect']) {
    // Angular puts a noop function when mapping an attribute to a
    // different local name. Hacking it out.
    // See https://docs.angularjs.org/api/ng/service/$compile#-scope-
    this.selectHandler = undefined;
  }

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;


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
        return '<div class="header ' + title + '">' +
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
  var empty_template = $('#empty-results').html(); // in base.html
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
        var currentLang = this.gettextCatalog_.currentLanguage;

        if (documents.length === 0) {
          $('.tt-dataset.empty').remove();
          $('.tt-empty').append(empty_template);
        } else {
          $('.tt-dataset.empty').remove();
        }

        return documents.map(function(/** appx.SearchDocument */ doc) {
          var locale = doc.locales[0];
          doc.label = type === 'routes' && locale.title_prefix ?
              locale.title_prefix + ' : ' : '';
          doc.label += locale.title;

          if (currentLang !== locale.lang) {
            doc.label += ' (' + locale.lang + ')';
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
 * @param {!appx.SearchDocument} doc Suggested document.
 * @param {TypeaheadDataset} dataset Dataset.
 * @this {app.SearchController}
 * @private
 */
app.SearchController.select_ = function(event, doc, dataset) {
  if (this.selectHandler) {
    this.selectHandler({'doc': doc});
  } else {
    var lang = doc.locales[0].lang;
    var type = doc.documentType;
    var url = app.utils.buildDocumentUrl(type, doc.document_id, lang);
    window.location.href = url;
  }
};

app.module.controller('AppSearchController', app.SearchController);
