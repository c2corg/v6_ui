
import createTemplate from './create.html';
import emptyTemplate from './empty.html';
import tooManyTemplate from './too-many.html';

const MAX_RESULTS_NB = 7;

/**
 * @constructor
 * @param {!angular.Scope} $scope Angular scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {app.Document} DocumentService service
 * @param {app.Authentication} AuthenticationService service
 * @param {angular.Attributes} $attrs Angular attributes.
 * @param {string} apiUrl Base URL of the API.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.Url} appUrl URL service.
 * @ngInject
 */
export default class {
  constructor(DocumentService, $scope, $compile, apiUrl, gettextCatalog, AuthenticationService,
    UrlService, UtilsService) {
    'ngInject';

    this.utilsService_ = UtilsService;

    /**
     * @type {app.Document}
     * @private
     */
    this.documentService_ = DocumentService;

    /**
     * @type {angular.$compile}
     * @private
     */
    this.compile_ = $compile;

    /**
     * @type  {app.Authentication} AuthenticationService
     * @private
     */
    this.authenticationService_ = AuthenticationService;

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
     * @type {ngeox.SearchDirectiveListeners}
     * @export
     */
    this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
      select: this.select_.bind(this)
    });

    /**
     * @type {Object}
     * @private
     */
    this.nbResults_ = {};
  }

  $onInit() {
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
  }

  /**
   * @param {string} type The document type.
   * @return {TypeaheadDataset} A data set.
   * @private
   */
  createDataset_(type) {
    const bloodhoundEngine = this.createAndInitBloodhound_(type);
    return (
      /** @type {TypeaheadDataset} */{
        contents: type,
        source: bloodhoundEngine.ttAdapter(),
        display: doc => {
          if (doc) {
            return doc.label;
          }
        },
        limit: 20,
        templates: {
          header: () => {
            const typeUpperCase = type.charAt(0).toUpperCase() + type.substr(1);
            return '<div class="header" dataset="' + type + '">' +
              this.gettextCatalog_.getString(typeUpperCase) + '</div>';
          },
          footer: doc => {
            let template;
            if (this.isStandardSearch) {
              template = '<p class="suggestion-more"><a href="/' + type +
                '#q=' + encodeURI(doc['query']) + '" class="green-text" translate>' +
                this.gettextCatalog_.getString('see more results') + '</a></p>';
              return this.compile_(template)(this.scope_);
            } else if (this.nbResults_[type] > MAX_RESULTS_NB) {
              template = tooManyTemplate;
              return this.compile_(template)(this.scope_);
            }
            return '';
          },
          suggestion: doc => {
            if (doc) {
              this.scope_['doc'] = doc;
              return this.compile_('<c2c-suggestion class="tt-suggestion"></c2c-suggestion>')(this.scope_);
            } else {
              return '<div class="ng-hide"></div>';
            }
          },
          empty: () => {
            if ($('.header.empty').length === 0) {
              const template = this.isStandardSearch ? createTemplate : emptyTemplate;
              return this.compile_(template)(this.scope_);
            }
          }
        }
      }
    );
  }

  /**
   * @param {string} type The document type.
   * @return {Bloodhound} The bloodhound engine.
   * @private
   */
  createAndInitBloodhound_(type) {
    const url = this.apiUrl_ + '/search?q=%QUERY';

    const bloodhound = new Bloodhound(/** @type {BloodhoundOptions} */({
      limit: MAX_RESULTS_NB,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
      remote: {
        url: url,
        wildcard: '%QUERY',
        rateLimitWait: 300,
        prepare: (query, settings) => {
          // reset results numbers
          this.nbResults_ = {};

          let url = settings['url'] + '&pl=' + this.gettextCatalog_.currentLanguage;
          url += '&limit=' + MAX_RESULTS_NB;

          if (this.dataset) {
            // add the Auth header if searching for users
            if (this.dataset.indexOf('u') > -1 && this.authenticationService_.isAuthenticated()) {
              settings['headers'] = {
                'Authorization': 'JWT token="' + this.authenticationService_.userData.token + '"'
              };
            }
            url = url + '&t=' + this.dataset.split('').join(',');
          }
          settings['url'] = url.replace('%QUERY', encodeURIComponent(query));
          return settings;
        },
        filter: resp => {
          const documentResponse = (resp[type]);
          if (documentResponse) {
            this.nbResults_[type] = documentResponse.total;
            return documentResponse.documents
              .filter(doc => this.ignoreDocumentId === undefined || this.ignoreDocumentId !== doc.document_id)
              .filter(doc => {
                // Show result if:
                // - in the frame of a standard simple-search
                // - explicitly skipping the association check
                // - if not already associated for other simple-searches
                return (this.isStandardSearch || this.skipAssociationFilter ||
                  !this.documentService_.hasAssociation(type,  doc.document_id));
              })
              .map(doc => {
                doc.label = this.createDocLabel_(doc, this.gettextCatalog_.currentLanguage);
                doc.documentType = type;
                return doc;
              });
          }
        }
      }
    }));
    bloodhound.initialize();
    return bloodhound;
  }

  /**
   * Return username as label or create a document title
   * @param {!appx.SimpleSearchDocument} doc Suggested document.
   * @param {string} currentLang
   * @return {string} label
   * @private
   */
  createDocLabel_(doc, currentLang) {
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
  }


  /**
   * @param {jQuery.Event} event Event.
   * @param {!appx.SimpleSearchDocument} doc Suggested document.
   * @param {TypeaheadDataset} dataset Dataset.
   * @this {app.SimpleSearchController}
   * @private
   */
  select_(event, doc, dataset) {
    if (this.selectHandler) {
      this.selectHandler({'doc': doc});
    } else {
      window.location.href = this.urlService.buildDocumentUrl(
        doc.documentType, doc.document_id, doc.locales[0]);
    }
  }
}
