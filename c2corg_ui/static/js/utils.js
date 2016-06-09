goog.provide('app.utils');


/**
 * @param {string} type Short document type code.
 * @return {string} Full document type name.
 */
app.utils.getDoctype = function(type) {
  // TODO add other types
  switch (type) {
    case 'w':
      return 'waypoints';
    case 'r':
      return 'routes';
    case 'o':
      return 'outings';
    case 'u':
      return 'users';
    case 'i':
      return 'images';
    default:
      goog.asserts.fail('Unrecognized type: ' + type);
      return '';
  }
};


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
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.utils.pushToArray = function(object, property, value, event) {
  var checkbox = $(event.currentTarget).find('input') || null;

  if (typeof value === 'boolean') {
    object[property] = value;
    checkbox.prop('checked', true);
    return true;
  } else {
    if (!object[property]) {
      object[property] = [];
    }

    if (object[property].indexOf(value) === -1) {
      object[property].push(value);
      checkbox.prop('checked', true);
      return true;
    } else {
      object[property].splice(object[property].indexOf(value), 1);
      checkbox.prop('checked', false);
      return false;
    }
  }
};


/**
 * @export
 */
app.utils.animateHeaderIcon = function(e) {
  // TO FIX - if you quickly double-click, it will add/remove classes even when div is or has already collapsed
  if ($(e.target).hasClass('closed') && $(e.target).parent().find('.collapsing').length === 0) {
    $(e.target).removeClass('closed');
  } else {
    $(e.target).addClass('closed');
  }
  var menuDown = $(e.target).find('.glyphicon-menu-down');
  var menuUp = $(e.target).find('.glyphicon-menu-right');

  if (menuDown.length > 0) {
    menuDown.toggleClass('rotate-arrow-up');
  } else if (menuUp.length > 0) {
    menuUp.toggleClass('rotate-arrow-down');
  }
  return;
};


/**
 * @export
 * @param {string} date
 */
app.utils.formatDate = function(date) {
  return new Date(date);
};


/**
 * @export
 * @param {Date} date1
 * @param {Date} date2
 */
app.utils.areDifferentDates = function(date1, date2) {
  if (date1 !== null && date2 !== null) {
    return date1.toDateString() !== date2.toDateString();
  }
};


/**
 * convert an image File into a base64 string
 * @property {Object} uploaded Image File
 * @export
 */
app.utils.getImageFileBase64Source = function(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    return file.src = e.target.result;
  };
  reader.readAsDataURL(file);
};


/**
 * @param {Object} file : image object from associations or uploaded
 * @return {string}
 * @export
 */
app.utils.createImageSlide = function(file) {
  var img;
  var ahref;
  // if !src => it's an already existing image, else it's an image that has just been uploaded
  if (!file['src']) {
    ahref = '<a href="' + app.constants.imagesURL + file.filename + '" data-info-id="' + file['document_id'] + '">';
    img = '<img src="' + app.constants.imagesURL + file.filename + '">';
  } else {
    ahref = '<a href="' + file['src'] + '" data-info-id="' + file['document_id'] + '">';
    img = '<img src=" ' + file['src'] + '">';
  }
  return '<figure id="image-' + file['document_id'] + '">' +
               ahref + img +
               '</a>' +
               '<app-slide-info></app-slide-info>' +
             '</figure>';
};
