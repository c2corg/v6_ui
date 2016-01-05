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
