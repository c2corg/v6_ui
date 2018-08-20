import slugify from 'slugify';

export default class UrlService {
  constructor() {
    'ngInject';

    slugify.extend({'\'': ' '});

    /**
     * @type {function(string):string}
     * @private
     */
    this.slugify_ = slugify;
  }

  /**
   * @param {string} documentType The document type.
   * @param {number} documentId The document id.
   * @param {appx.DocumentLocale} locale Document locale data.
   * @param {string=} lang Lang.
   * @return {string} Url.
   */
  buildDocumentUrl(documentType, documentId, locale, lang) {
    lang = lang || locale['lang'];

    if (documentType === 'profiles' || documentType === 'users') {
      return '/profiles/{id}/{lang}'
        .replace('{id}', String(documentId))
        .replace('{lang}', lang);
    }

    let title = '';
    if (locale && documentType === 'routes' && locale['title_prefix']) {
      title = locale['title_prefix'] + ' ';
    }
    title += locale['title'];
    return '/{type}/{id}/{lang}/{slug}'
      .replace('{type}', documentType)
      .replace('{id}', String(documentId))
      .replace('{lang}', lang)
      .replace('{slug}', this.slugify_(title, {lower: true}) || '-');
  }
}
