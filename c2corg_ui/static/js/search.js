goog.provide('app.SearchController');
goog.provide('app.searchDirective');

goog.require('app');
goog.require('app.utils');
/** @suppress {extraRequire} */
goog.require('ngeo.searchDirective');

/**
 * The directive for the auto-complete search field shown in the header
 * of every page.
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} Directive Definition Object.
 */
app.searchDirective = function($compile) {
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
         * @param {angular.Scope} $scope Scope.
         * @param {angular.JQLite} element Element.
         */
        function($scope, element) {

          var phoneScreen = app.constants.SCREEN.SMARTPHONE;

          // Empty the search field on focus and blur.
          $('.page-header').find('input').on('focus blur', function() {
            $(this).typeahead('val', '');
          });

          //Remove the class 'show-search' when screen width > @phone (defined in LESS)
          $(window).resize(function resize() {
            if ($(window).width() > phoneScreen) {
              $('.show-search').removeClass('show-search');
              $('.logo.header, .menu-open-close.header').removeClass('no-opacity');
            }
          });

          element.on('click', function(e) {

            // collapse suggestions
            if ($('app-search .header').is(e.target)) {
              $(e.target).siblings('.tt-suggestion').slideToggle();
            }

            // Trigger focus on search-icon click for .search
            if (window.innerWidth < phoneScreen) {
              if ($('.page-header .search-icon').is(e.target)) {
                $('.page-header').find('.quick-search').toggleClass('show-search');
                $('.page-header').find('.search').focus();
                $('.logo.header, .menu-open-close.header').toggleClass('no-opacity');
              }
            }
          });

          // hide the menu when click outside (smartphone)
          $('main').click(function(e) {
            if (window.innerWidth < phoneScreen) {
              $('.show-search').removeClass('show-search');
              $('.logo.header, .menu-open-close.header').removeClass('no-opacity');
            }
          });

          //show spinning gif while waiting for the results
          element.on('typeahead:asyncrequest', function() {
            element.find('input').addClass('loading-gif-typehead');
          });
          element.on('typeahead:asynccancel typeahead:asyncreceive', function() {
            element.find('input').removeClass('loading-gif-typehead');
          });

        }

  };
};

app.module.directive('appSearch', app.searchDirective);


/**
 * @constructor
 * @param {!angular.Scope} $scope Angular scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @param {angular.Attributes} $attrs Angular attributes.
 * @param {string} apiUrl Base URL of the API.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @ngInject
 */
app.SearchController = function($scope, $compile, $attrs, apiUrl, gettextCatalog, $templateCache) {

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
   * @type {angular.$templateCache}
   * @private
   */
  this.templatecache_ = $templateCache;

  /**
   * @type {string}
   * @private
   */
  this.apiUrl_ = apiUrl;

  /**
   * @type {!angular.Scope}
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
    this.createDataset_('waypoints'),
    this.createDataset_('routes'),
    this.createDataset_('outings')
  ];

  /**
   * @type {string}
   * @private
   */
  this.datasetLimit_ = $attrs['appDataset'];

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
 * @return {TypeaheadDataset} A data set.
 * @private
 */
app.SearchController.prototype.createDataset_ = function(type) {
  var bloodhoundEngine = this.createAndInitBloodhound_(type);
  return /** @type {TypeaheadDataset} */({
    contents : type,
    source: bloodhoundEngine.ttAdapter(),
    display: function(doc) {
      return doc.label;
    },
    limit: 20,
    templates: {
      header: (function() {
        return '<div class="header" dataset="' + type + '">' + this.gettextCatalog_.getString(type) + '</div>';
      }).bind(this),
      footer: function(doc) {
        return '<p class="suggestion-more"><a href="/' + type + '/keyword/' + encodeURI(doc['query']) + '" class="green-text">+ see more results</a></p>';
      },
      suggestion: function(doc) {
        this.scope_['doc'] = doc;
        return this.compile_('<app-suggestion  class="tt-suggestion"></app-suggestion>')(this.scope_);
      }.bind(this),
      empty: function(res) {
        if ($('.header.empty').length === 0) {
          return this.compile_(this.templatecache_.get('/static/partials/suggestionempty.html'))(this.scope_);
        }
      }.bind(this)
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
    limit: 7,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    remote: {
      url: url,
      wildcard: '%QUERY',
      rateLimitWait: 50,
      prepare: (function(query, settings) {

        var url = settings['url'] +
                '&pl=' + this.gettextCatalog_.currentLanguage;

        if (this.datasetLimit_) {
          if (this.datasetLimit_.length === 1) {
            url = url + '&t=' + this.datasetLimit_;
          } else {
            // you receive for ex 'wru' (waypoints, routes, users) -> split into w,r,u
            this.datasetLimit_ = this.datasetLimit_.split('').join(',');
          }
        }
        settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
        return settings;
      }).bind(this),

      filter: (function(/** appx.SearchResponse */ resp) {
        var documentResponse =
                /** @type {appx.SearchDocumentResponse} */ (resp[type]);
        if (documentResponse) {
          var documents = documentResponse.documents;
          var currentLang = this.gettextCatalog_.currentLanguage;

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
        }
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
