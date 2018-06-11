export default class LangController {
  constructor(LangService) {
    'ngInject';

    /**
     * @type {app.Lang}
     * @private
     */
    this.langService_ = LangService;

    /**
     * @type {Array.<string>}
     * @export
     */
    this.langs = LangService.getAvailableLangs();

    /**
     * @type {string}
     * @export
     */
    this.lang = LangService.getLang();
  }

  updateLang(lang) {
    if (this.langs.indexOf(lang) > -1) {
      this.lang = lang;
      this.langService_.updateLang(lang, /* syncWithApi */ true);
    }
  }
}
