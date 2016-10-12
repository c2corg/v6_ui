goog.provide('app.SimpleSearchController');
goog.provide('app.simpleSearchDirective');

goog.require('app');
goog.require('app.Document');
goog.require('app.Url');
/** @suppress {extraRequire} */
goog.require('ngeo.searchDirective');

/**
 * The directive for the auto-complete search field shown in the header
 * of every page.
 * @return {angular.Directive} Directive Definition Object.
 */
app.simpleSearchDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppSimpleSearchController',
    bindToController: {
      selectHandler: '&appSelect'
    },
    controllerAs: 'searchCtrl',
    templateUrl: '/static/partials/simplesearch.html',
    link:
        /**
         * @param {angular.Scope} $scope Scope.
         * @param {angular.JQLite} element Element.
         */
        function($scope, element, attrs, ctrl) {

          var phoneScreen = app.constants.SCREEN.SMARTPHONE;
          // don't show "show more" button for this cases.
          if ($(element).closest('app-add-association').length
                  || $(element).closest('#participants-group').length
                  || $(element).closest('.section.associations').length) {
            ctrl.associationContext_ = true;
          }

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
            if ($('app-simple-search .header').is(e.target)) {
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

app.module.directive('appSimpleSearch', app.simpleSearchDirective);


/**
 * @constructor
 * @param {!angular.Scope} $scope Angular scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {angular.$templateCache} $templateCache service
 * @param {app.Document} appDocument service
 * @param {app.Authentication} appAuthentication service
 * @param {angular.Attributes} $attrs Angular attributes.
 * @param {string} apiUrl Base URL of the API.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Url} appUrl URL service.
 * @ngInject
 */
app.SimpleSearchController = function(appDocument, $scope, $compile, $attrs, apiUrl,
    gettextCatalog, $templateCache, appAuthentication, appUrl) {

  /**
   * @type {app.Document}
   * @private
   */
  this.documentService_ = appDocument;

  /**
   * Bound from directive.
   * @type {function({doc: appx.SimpleSearchDocument})|undefined}
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
   * @type  {app.Authentication} appAuthentication
   * @private
   */
  this.auth_ = appAuthentication;

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
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

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
  this.datasets = [];

  /**
   * @type {string}
   * @private
   */
  this.datasetLimit_ = $attrs['dataset'];

  // create only given datasets
  for (var i = 0; i < this.datasetLimit_.length; i++) {
    switch (this.datasetLimit_[i]) {
      case 'u':
        this.datasets.push(this.createDataset_('users'));
        break;
      case 'o':
        this.datasets.push(this.createDataset_('outings'));
        break;
      case 'w':
        this.datasets.push(this.createDataset_('waypoints'));
        break;
      case 'r':
        this.datasets.push(this.createDataset_('routes'));
        break;
      case 'a':
        this.datasets.push(this.createDataset_('areas'));
        break;
      default:
        break;
    }
  }

  /**
   * @type {boolean}
   * @private
   */
  this.associationContext_ = false;

  /**
   * @type {ngeox.SearchDirectiveListeners}
   * @export
   */
  this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
    select: app.SimpleSearchController.select_.bind(this)
  });
};


/**
 * @param {string} type The document type.
 * @return {TypeaheadDataset} A data set.
 * @private
 */
app.SimpleSearchController.prototype.createDataset_ = function(type) {
  var bloodhoundEngine = this.createAndInitBloodhound_(type);
  return /** @type {TypeaheadDataset} */({
    contents : type,
    source: bloodhoundEngine.ttAdapter(),
    display: function(doc) {
      if (doc) {
        return doc.label;
      }
    },
    limit: 20,
    templates: {
      header: (function() {
        var typeUpperCase = type.charAt(0).toUpperCase() + type.substr(1);
        return '<div class="header" dataset="' + type + '">' +  this.gettextCatalog_.getString(typeUpperCase) + '</div>';
      }).bind(this),
      footer: function(doc) {
        if (!this.associationContext_) {
          // don't add this if you're typing in an add-association-tool
          var moreLink = '<p class="suggestion-more"><a href="/' + type +
            '#q=' + encodeURI(doc['query']) + '" class="green-text" translate>' +
            this.gettextCatalog_.getString('see more results') + '</a></p>';
          return this.compile_(moreLink)(this.scope_);
        }
        return '';
      }.bind(this),
      suggestion: function(doc) {
        if (doc) {
          this.scope_['doc'] = doc;
          return this.compile_('<app-suggestion class="tt-suggestion"></app-suggestion>')(this.scope_);
        } else {
          return '<div class="ng-hide"></div>';
        }
      }.bind(this),
      empty: function(res) {
        if ($('.header.empty').length === 0) {
          return this.compile_(this.templatecache_.get('/static/partials/suggestions/empty.html'))(this.scope_);
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
app.SimpleSearchController.prototype.createAndInitBloodhound_ = function(type) {
  var url = this.apiUrl_ + '/search?q=%QUERY';

  var bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
    limit: 7,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    remote: {
      url: url,
      wildcard: '%QUERY',
      rateLimitWait: 300,
      prepare: (function(query, settings) {

        var url = settings['url'] + '&pl=' + this.gettextCatalog_.currentLanguage;

        if (this.datasetLimit_) {
          // add the Auth header if searching for users
          if (this.datasetLimit_.indexOf('u') > -1 && this.auth_.isAuthenticated()) {
            settings['headers'] = {
              'Authorization': 'JWT token="' + this.auth_.userData.token + '"'
            };
          }
          url = url + '&t=' + this.datasetLimit_.split('').join(',');
        }
        settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
        return settings;
      }).bind(this),

      filter: (function(/** appx.SimpleSearchResponse */ resp) {
        var documentResponse =
                /** @type {appx.SimpleSearchDocumentResponse} */ (resp[type]);
        if (documentResponse) {
          var documents = documentResponse.documents;
          var hasAssociation;

          return documents.map(function(/** appx.SimpleSearchDocument */ doc) {
            hasAssociation = this.documentService_.hasAssociation(type,  doc.document_id);
            doc.label = this.createDocLabel_(doc, this.gettextCatalog_.currentLanguage);
            doc.documentType = type;

            // don't show already associated docs in the results, but only in the app-add-association
            // -> everything should be shown in the main simple-search.
            if (!this.associationContext_ || (this.associationContext_ && !hasAssociation)) {
              return doc;
            }
          }.bind(this));
        }
      }).bind(this)
    }
  }));
  bloodhound.initialize();
  return bloodhound;
};

/**
 * Return username as label or create a document title
 * @param {!appx.SimpleSearchDocument} doc Suggested document.
 * @param {string} currentLang
 * @return {string} label
 * @private
 */
app.SimpleSearchController.prototype.createDocLabel_ = function(doc, currentLang) {
  var locale = doc.locales[0];
  var label = '';
  if (doc.type === 'u') {
    return doc.name;
  }
  if (doc.type === 'r' && locale.title_prefix) {
    label = locale.title_prefix + ' : ';
  }
  label += locale.title;

  if (currentLang !== locale.lang) {
    label += ' (' + locale.lang + ')';
  }
  return label;
};


/**
 * @param {jQuery.Event} event Event.
 * @param {!appx.SimpleSearchDocument} doc Suggested document.
 * @param {TypeaheadDataset} dataset Dataset.
 * @this {app.SimpleSearchController}
 * @private
 */
app.SimpleSearchController.select_ = function(event, doc, dataset) {
  if (this.selectHandler) {
    this.selectHandler({'doc': doc});
  } else {
    window.location.href = this.url_.buildDocumentUrl(
      doc.documentType, doc.document_id, doc.locales[0]);
  }
};

app.module.controller('AppSimpleSearchController', app.SimpleSearchController);
