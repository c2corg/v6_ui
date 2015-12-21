goog.provide('app.utils');

goog.require('goog.asserts');


/**
 * @param {string} document_type The document type.
 * @param {string} documentId The document id.
 * @param {string} culture Culture.
 * @return {string} Url.
 */
app.utils.buildDocumentUrl = function(document_type, documentId, culture) {
  return '/{document_type}/{id}/{culture}'
    .replace('{document_type}', document_type)
    .replace('{id}', documentId)
    .replace('{culture}', culture);
};


/**
 * Cultures ordered by their relevance.
 * @const
 * @type {Array.<string>}
 */
app.utils.LANG_PRIORITY = ['fr', 'en', 'it', 'de', 'es', 'ca', 'eu'];


/**
 * Get the "best" locale for a document. If available this is the
 * `preferedCulture` (usually the interface language), if not the locale in
 * the "most relevant" culture.
 *
 * @param {appx.SearchDocument} doc The document.
 * @param {string} preferedCulture The prefered culture
 * @param {Array.<string>} cultures All cultures.
 * @return {appx.SearchDocumentLocale} The "best" culture.
 */
app.utils.getBestLocale = function(doc, preferedCulture, cultures) {
  var locales = doc.locales;
  var availableLocales = {};
  locales.forEach(function(locale) {
    availableLocales[locale.culture] = locale;
  });

  if (availableLocales[preferedCulture] !== undefined) {
    return availableLocales[preferedCulture];
  } else {
    var localeToUse = null;
    app.utils.LANG_PRIORITY.some(function(culture) {
      if (availableLocales[culture] !== undefined) {
        localeToUse = availableLocales[culture];
        // stop
        return true;
      }
      return false;
    });
    goog.asserts.assert(localeToUse !== null);
    return localeToUse;
  }
};


/**
 * Get the index of the "best" language in the provided array.
 * If available this is the index of the language of the interface.
 * Otherwise the index of the first available language from LANG_PRIORITY.
 *
 * @param {Array.<string>} available The list of available languages. This list
 * should contain at least one valid language.
 * @param {string=} opt_prefered Prefered language (default to the
 * interface language).
 * @return {number} The index of the best language.
 */
app.utils.getBestLangIndex = function(available, opt_prefered) {
  if (available.length === 1) {
    // most of the time there is only one language
    return 0;
  }

  var prefered = opt_prefered || window.localStorage.getItem('interface_lang');

  var idx = available.indexOf(prefered);
  if (idx !== -1) {
    return idx;
  }

  for (var i = 0, lang; i < app.utils.LANG_PRIORITY.length; i++) {
    lang = app.utils.LANG_PRIORITY[i];
    idx = available.indexOf(lang);
    if (idx !== -1) {
      return idx;
    }
  }

  // Should never happen
  goog.asserts.fail('Error finding best language in', available, prefered);
};
