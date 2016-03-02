goog.provide('app.utils');


/**
 * @param {string} document_type The document type.
 * @param {string|number} documentId The document id.
 * @param {string} lang Lang.
 * @return {string} Url.
 */
app.utils.buildDocumentUrl = function(document_type, documentId, lang) {
  return '/{document_type}/{id}/{lang}'
    .replace('{document_type}', document_type)
    .replace('{id}', String(documentId))
    .replace('{lang}', lang);
};


/**
 * @param {ol.interaction.MouseWheelZoom} mouseWheelZoomInteraction
 */
app.utils.setupSmartScroll = function(mouseWheelZoomInteraction) {
  var scrollTimer;
  $(window).on('scroll', function(e) {
    mouseWheelZoomInteraction.setActive(false);
    if (scrollTimer) {
      clearInterval(scrollTimer);
    }
    scrollTimer = setTimeout(function() {
      mouseWheelZoomInteraction.setActive(true);
    }, 500);
  });
};
