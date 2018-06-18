export default class LangService {
  /**
   * @param {angular.$cookies} $cookies Cookies service.
   * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
   * @param {ngeo.GetBrowserLanguage} ngeoGetBrowserLanguage
   *        GetBrowserLanguage Service.
   * @param {Array.<string>} langs List of available langs.
   * @param {amMoment} amMoment angular moment directive.
   * @param {app.Api} ApiService Api service.
   * @param {app.Authentication} AuthenticationService Authentication service.
   * @param {string} langUrlTemplate Language URL template.
   * @param {string} langMomentPath Path to the moment.js language files.
   */
  constructor($cookies, gettextCatalog, ngeoGetBrowserLanguage, langs,
    amMoment, ApiService, AuthenticationService, langUrlTemplate, langMomentPath) {
    'ngInject';

    /**
     * @type {angular.$cookies}
     * @private
     */
    this.cookies_ = $cookies;

    /**
     * @type {angularGettext.Catalog}
     * @private
     */
    this.gettextCatalog_ = gettextCatalog;

    /**
     * @type {ngeo.GetBrowserLanguage}
     * @private
     */
    this.ngeoGetBrowserLanguage_ = ngeoGetBrowserLanguage;

    /**
     * @type {Array.<string>}
     * @private
     */
    this.langs_ = langs;

    /**
     * @type {amMoment}
     */
    this.amMoment_ = amMoment;

    /**
     * @type {string}
     */
    this.langMomentPath_ = langMomentPath;

    /**
     * @type {app.Api}
     * @private
     */
    this.apiService_ = ApiService;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.AuthenticationService_ = AuthenticationService;

    /**
     * @type {string}
     * @private
     */
    this.langUrlTemplate_ = langUrlTemplate;

    this.updateLang(
      this.cookies_.get('interface_lang') ||
      this.ngeoGetBrowserLanguage_(this.langs_) || 'fr'
    );
  }

  /**
   * @return {Array.<string>}
   */
  getAvailableLangs() {
    return this.langs_;
  }


  /**
   * @export
   * @return {string}
   */
  getLang() {
    return this.gettextCatalog_.currentLanguage;
  }


  /**
   * @export
   * @param {string} str
   * @return {string}
   */
  translate(str) {
    return this.gettextCatalog_.getString(str);
  }


  /**
   * Alias of the translate() function, to be used in JS files
   * to have passed strings extracted.
   * @export
   * @param {string} str
   * @return {string}
   */
  gettext(str) {
    return this.translate(str);
  }


  /**
   * @param {string} lang
   * @param {boolean=} opt_syncWithApi
   */
  updateLang(lang, opt_syncWithApi) {
    this.gettextCatalog_.setCurrentLanguage(lang);
    this.gettextCatalog_.loadRemote(
      this.langUrlTemplate_.replace('__lang__', lang));
    // store the interface language as cookie, so that it is available on the
    // server side.
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1); // today + 1 year
    this.cookies_.put('interface_lang', lang, {
      'path': '/',
      'expires': d
    });

    if (opt_syncWithApi && this.AuthenticationService_.isAuthenticated()) {
      this.apiService_.updatePreferredLanguage(lang);
    }

    if (lang === 'en') {
      lang = 'en-gb';
    }

    // This will retrieve then _evaluate_ the content of the file.
    $.get(this.langMomentPath_ + '/' + lang + '.js', () => {
      this.amMoment_.changeLocale(lang);
    });
  }
}
