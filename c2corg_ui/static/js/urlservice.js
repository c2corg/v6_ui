goog.provide('app.Url');

goog.require('app');


/**
 * @param {function(string):string} slug angular-slug service.
 * @constructor
 * @ngInject
 * @struct
 */
app.Url = function(slug) {

  slug.defaults.modes['custom'] = {
    replacement: '-',
    symbols: false,
    remove: null,
    lower: true,
    charmap: angular.extend({'\'': ' '}, slug.defaults.charmap),
    multicharmap: slug.defaults.multicharmap
  };
  slug.defaults.mode = 'custom';

  /**
   * @type {function(string):string}
   * @private
   */
  this.slug_ = slug;
};


/**
 * @param {string} documentType The document type.
 * @param {number} documentId The document id.
 * @param {appx.DocumentLocale} locale Document locale data.
 * @param {string=} lang Lang.
 * @return {string} Url.
 */
app.Url.prototype.buildDocumentUrl = function(documentType, documentId, locale, lang) {
  lang = lang || locale['lang'];

  if (documentType === 'profiles' || documentType === 'users') {
    return '/profiles/{id}/{lang}'
    .replace('{id}', String(documentId))
    .replace('{lang}', lang);
  }

  var title = '';
  if (locale && documentType === 'routes' && locale['title_prefix']) {
    title = locale['title_prefix'] + ' ';
  }
  title += locale['title'];
  return '/{type}/{id}/{lang}/{slug}'
    .replace('{type}', documentType)
    .replace('{id}', String(documentId))
    .replace('{lang}', lang)
    .replace('{slug}', this.slug_(title) || '-');
};


app.module.service('appUrl', app.Url);
