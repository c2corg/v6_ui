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


/**
 * Update arrays and creates one, if not existing
 * form : object[property] = value
 * returns true if the item has been pushed into the array, false if removed.
 * @param {Object} object
 * @param {string} property
 * @param {string} value
 * @export
 */

app.utils.pushToArray = function(object, property, value) {
  if (!object[property]) {
    object[property] = [];
  }
  if (object[property].indexOf(value) === -1) {
    object[property].push(value);
    return true;
  } else {
    object[property].splice(object[property].indexOf(value), 1);
    return false;
  }
}


/**
 * @export
 */
app.utils.animateHeaderIcon = function(e) {
  var menuDown = $(e.target).find('.glyphicon-menu-down');
  var menuUp = $(e.target).find('.glyphicon-menu-right');
  if (menuDown) {
    menuDown.toggleClass('rotate-arrow-up');
  } else if (menuUp) {
    menuUp.toggleClass('rotate-arrow-down');
  }
  return;
}
