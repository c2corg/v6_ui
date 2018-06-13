/**
 * @module app.SimpleSearchController
 */
import appBase from './index.js';
import appUtils from './utils.js';
import UrlService from '../../js/url/url.service.js';

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
const exports = function(appDocument, $scope, $compile, $attrs, apiUrl,
  gettextCatalog, $templateCache, appAuthentication, UrlService) {

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
  this.urlService = UrlService;

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
   * @export
   */
  this.dataset;

  // create only given datasets
  for (let i = 0; i < this.dataset.length; i++) {
    switch (this.dataset[i]) {
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
      case 'c':
        this.datasets.push(this.createDataset_('articles'));
        break;
      case 'b':
        this.datasets.push(this.createDataset_('books'));
        break;
      case 'x':
        this.datasets.push(this.createDataset_('xreports'));
        break;
      case 'i':
        this.datasets.push(this.createDataset_('images'));
        break;
      default:
        break;
    }
  }

  /**
   * @type {boolean}
   * @export
   */
  this.isStandardSearch;

  /**
   * @type {boolean}
   * @export
   */
  this.skipAssociationFilter;

  /**
   * @type {number}
   * @export
   */
  this.ignoreDocumentId;

  /**
   * @type {ngeox.SearchDirectiveListeners}
   * @export
   */
  this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
    select: exports.select_.bind(this)
  });

  /**
   * @type {Object}
   * @private
   */
  this.nbResults_ = {};
};


/**
 * @type {number}
 * @const
 */
exports.MAX_RESULTS_NB = 7;


/**
 * @param {string} type The document type.
 * @return {TypeaheadDataset} A data set.
 * @private
 */
exports.prototype.createDataset_ = function(type) {
  const bloodhoundEngine = this.createAndInitBloodhound_(type);
  return (
    /** @type {TypeaheadDataset} */{
      contents: type,
      source: bloodhoundEngine.ttAdapter(),
      display: function(doc) {
        if (doc) {
          return doc.label;
        }
      },
      limit: 20,
      templates: {
        header: (function() {
          const typeUpperCase = type.charAt(0).toUpperCase() + type.substr(1);
          return '<div class="header" dataset="' + type + '">' +
            this.gettextCatalog_.getString(typeUpperCase) + '</div>';
        }).bind(this),
        footer: function(doc) {
          let template;
          if (this.isStandardSearch) {
            template = '<p class="suggestion-more"><a href="/' + type +
              '#q=' + encodeURI(doc['query']) + '" class="green-text" translate>' +
              this.gettextCatalog_.getString('see more results') + '</a></p>';
            return this.compile_(template)(this.scope_);
          } else if (this.nbResults_[type] > exports.MAX_RESULTS_NB) {
            template = appUtils.getTemplate(
              '/static/partials/suggestions/toomany.html',
              this.templatecache_);
            return this.compile_(template)(this.scope_);
          }
          return '';
        }.bind(this),
        suggestion: function(doc) {
          if (doc) {
            this.scope_['doc'] = doc;
            return this.compile_(
              '<app-suggestion class="tt-suggestion"></app-suggestion>'
            )(this.scope_);
          } else {
            return '<div class="ng-hide"></div>';
          }
        }.bind(this),
        empty: function(res) {
          if ($('.header.empty').length === 0) {
            const partialFile = this.isStandardSearch ? 'create' : 'empty';
            const template = appUtils.getTemplate(
              '/static/partials/suggestions/' + partialFile + '.html',
              this.templatecache_);
            return this.compile_(template)(this.scope_);
          }
        }.bind(this)
      }
    }
  );
};

/**
 * @param {string} type The document type.
 * @return {Bloodhound} The bloodhound engine.
 * @private
 */
exports.prototype.createAndInitBloodhound_ = function(type) {
  const url = this.apiUrl_ + '/search?q=%QUERY';

  const bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
    limit: exports.MAX_RESULTS_NB,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
    remote: {
      url: url,
      wildcard: '%QUERY',
      rateLimitWait: 300,
      prepare: (function(query, settings) {

        // reset results numbers
        this.nbResults_ = {};

        let url = settings['url'] + '&pl=' + this.gettextCatalog_.currentLanguage;
        url += '&limit=' + exports.MAX_RESULTS_NB;

        if (this.dataset) {
          // add the Auth header if searching for users
          if (this.dataset.indexOf('u') > -1 && this.auth_.isAuthenticated()) {
            settings['headers'] = {
              'Authorization': 'JWT token="' + this.auth_.userData.token + '"'
            };
          }
          url = url + '&t=' + this.dataset.split('').join(',');
        }
        settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
        return settings;
      }).bind(this),

      filter: (function(/** appx.SimpleSearchResponse */ resp) {
        const documentResponse =
          /** @type {appx.SimpleSearchDocumentResponse} */ (resp[type]);
        if (documentResponse) {
          this.nbResults_[type] = documentResponse.total;
          let documents = documentResponse.documents;
          documents = documents.map((/** appx.SimpleSearchDocument */ doc) => {
            if (this.ignoreDocumentId !== undefined && this.ignoreDocumentId === doc.document_id) {
              return null;
            }

            doc.label = this.createDocLabel_(doc, this.gettextCatalog_.currentLanguage);
            doc.documentType = type;
            // Show result if:
            // - in the frame of a standard simple-search
            // - explicitly skipping the association check
            // - if not already associated for other simple-searches
            if (this.isStandardSearch || this.skipAssociationFilter ||
                !this.documentService_.hasAssociation(type,  doc.document_id)) {
              return doc;
            }
            return null;
          });

          return documents.filter((doc) => {
            return doc !== null;
          });
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
exports.prototype.createDocLabel_ = function(doc, currentLang) {
  const locale = doc.locales[0];
  let label = '';
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
exports.select_ = function(event, doc, dataset) {
  if (this.selectHandler) {
    this.selectHandler({'doc': doc});
  } else {
    window.location.href = this.urlService.buildDocumentUrl(
      doc.documentType, doc.document_id, doc.locales[0]);
  }
};

appBase.module.controller('AppSimpleSearchController', exports);


export default exports;
