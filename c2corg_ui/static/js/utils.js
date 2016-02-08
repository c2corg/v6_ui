goog.provide('app.utils');

goog.require('goog.asserts');


/**
 * @param {string} document_type The document type.
 * @param {string} documentId The document id.
 * @param {string} lang Lang.
 * @return {string} Url.
 */
app.utils.buildDocumentUrl = function(document_type, documentId, lang) {
  return '/{document_type}/{id}/{lang}'
    .replace('{document_type}', document_type)
    .replace('{id}', documentId)
    .replace('{lang}', lang);
};
